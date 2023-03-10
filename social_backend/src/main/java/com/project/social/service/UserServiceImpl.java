package com.project.social.service;

import com.project.social.dto.FullResults;
import com.project.social.dto.PostDTO;
import com.project.social.entity.*;
import com.project.social.model.PostModel;
import com.project.social.model.UserModel;
import com.project.social.provider.Provider;
import com.project.social.repo.*;
import com.project.social.wrapper.PaginatedList;
import org.aspectj.util.FileUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Lazy;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import javax.persistence.criteria.CriteriaBuilder;
import javax.servlet.http.HttpServletRequest;
import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.*;

//i know its bad practice to have one huge service class but i didnt realize how large this was going to be
@Service
public class UserServiceImpl implements UserService {

    @Autowired
    private UserRepo userRepo;
    @Autowired
    private EmailService emailService;
    @Autowired
    private S3Service s3Service;
    @Autowired
    private PostRepo postRepo;
    @Autowired
    private CommentRepo commentRepo;
    @Autowired
    private RepostRepo repostRepo;
    @Autowired
    private FollowerRepo followerRepo;
    @Autowired
    private NotificationRepo notificationRepo;
    @Autowired
    private VerificationTokenRepo verificationTokenRepo;
    @Autowired
    @Lazy
    private PasswordEncoder passwordEncoder;

    @Override
    public List<User> getAllUsers() {
        return userRepo.findAll();
    }

    @Override
    public User findByUsername(String username) {
        return userRepo.findByUsername(username);
    }

    @Override
    public User findByEmail(String email) {
        return userRepo.findByEmail(email);
    }

    @Override
    public void processOAuthPostLogin(String email, String name, String role) {
        User tempUser = userRepo.findByEmail(email);

        if(tempUser == null) {
            User user = new User();
            user.setEmail(email);
            user.setFullName(name);
            user.setRole(role);
            user.setProvider(Provider.GOOGLE);
            user.setEnabled(true);

            userRepo.save(user);
        }
    }

    @Override
    public String processAccount(UserModel userModel, HttpServletRequest request) {
        User user = userRepo.findByEmail(userModel.getEmail());
        User usernameCheck = userRepo.findByUsername(userModel.getUsername());

        if(user != null) {
            System.out.println("EMAIL TAKEN");
            return "email taken";
        }

        if(usernameCheck != null) {
            System.out.println("USER TAKEN");
            return "username taken";
        }

        if(userModel.getEmail().trim() == "" || userModel.getPassword().trim() == "" || userModel.getFullName().trim() == "") {
            return "null fields";
        }

        user = new User();
        user.setEnabled(false);
        user.setRole("ROLE_USER");
        user.setPassword(passwordEncoder.encode(userModel.getPassword()));
        user.setProvider(Provider.LOCAL);
        user.setEmail(userModel.getEmail());
        user.setFullName(userModel.getFullName());
        user.setUsername(userModel.getUsername());

        if(userModel.getBio() == null) {
            user.setBio("User does not have a bio yet");
        }
        else {
            user.setBio(userModel.getBio());
        }

        emailService.sendEmail(userModel, request);

        userRepo.save(user);

        String res = s3Service.uploadToSpace(userModel.getProfilePicture(), userModel.getEmail());

        System.out.println("RES: "+res);

        return res;
    }

    @Override
    public String verifyAccount(String token) {
        //should design a check to make sure the token isnt older than n
        VerificationToken verificationToken = verificationTokenRepo.getTokenByToken(token);
        User user = userRepo.findByEmail(verificationToken.getUserEmail());
        user.setEnabled(true);
        userRepo.save(user);
        verificationTokenRepo.delete(verificationToken);

        return "User verified";
    }

    @Override
    public ProfileDetails getProfileDetails(String username, String email, Integer pageNum, String postType) throws Exception {
        User userProfile = userRepo.findByUsername(username); //details of whos profile we went to
        Optional<User> currentUser = Optional.ofNullable(userRepo.findByEmail(email)); //current user who went to profile
        boolean isFollowed = false;
        boolean followedBy = false;

        if(userProfile == null) {
            return new ProfileDetails();
        }

        //reposts and posts are included in this
        List<Post> returnPosts;

        //checking to see if we follow the user whose profile we are accessing
        if(currentUser.isPresent()) {
            //this condition is checking if we are returning regular posts/reposts
            if(postType.equalsIgnoreCase("posts")) {
                returnPosts = new ArrayList<>();
                userProfile.getPosts().forEach(post -> {
                    if(!post.isDeleted()) {
                        returnPosts.add(post);
                    }
                });
                List<Followers> followers = currentUser.get().getFollowing();
                for(Followers follower : followers) {
                    if(follower.getTo() == userProfile) {
                        isFollowed = true;
                    }
                }

                List<Followers> following = userProfile.getFollowing();
                for(Followers follow : following) {
                    if(follow.getTo().equals(currentUser.get())) {
                        followedBy = true;
                    }
                }

                //checking if the profile has reposted any posts
                userProfile.getReposts().forEach(repost -> {
                    Post post = repost.getRePost();
                    returnPosts.remove(post);
                    post.setPostDate(repost.getRepostDate());
                    if(currentUser.get().getUsername().equalsIgnoreCase(userProfile.getUsername())) {
                        post.setReposted(true);
                        post.setRepostedBy("me");
                    }
                    else {
                        post.setRepostedBy(userProfile.getUsername());
                    }
                    if(!post.isDeleted()) {
                        returnPosts.add(post);
                    }
                });

                //checking if the current user has reposted any of the profiles posts
                currentUser.get().getReposts().forEach(repost -> {
                    Post post = repost.getRePost();
                    if(returnPosts.contains(post) && !post.isDeleted()) {
                        returnPosts.remove(post);
                        post.setReposted(true);
                        returnPosts.add(post);
                    }
                });
            }
            else {
                //add just the liked posts
                List<Followers> followers = currentUser.get().getFollowing();
                for(Followers follower : followers) {
                    if(follower.getTo() == userProfile) {
                        isFollowed = true;
                    }
                }
                returnPosts = new ArrayList<>();
                userProfile.getLikedPosts().forEach(post -> {
                    if(!post.isDeleted()) {
                        returnPosts.add(post);
                    }
                });

                List<Followers> following = userProfile.getFollowing();
                for(Followers follow : following) {
                    if(follow.getTo().equals(currentUser.get())) {
                        followedBy = true;
                    }
                }
            }

            //checking if the current user has liked any posts
            returnPosts.forEach(post -> {
                if (post.getLikes().contains(currentUser.get())) {
                    post.setLiked(true);
                }
            });

            //checking if the current user has reposted any posts
            List<Repost> currentUsersReposts = currentUser.get().getReposts();
            List<Post> reposts = new ArrayList<>();
            currentUsersReposts.forEach(repost -> {
                if(!repost.getRePost().isDeleted()) {
                    reposts.add(repost.getRePost());
                }
            });
            returnPosts.forEach(post -> {
                if(reposts.contains(post)) {
                    post.setReposted(true);
                }
            });

        }
        else {
            //if there is no current user then there obviously they havent reposted/liked anything
            if(postType.equalsIgnoreCase("posts")) {
                returnPosts = new ArrayList<>();
                userProfile.getPosts().forEach(post -> {
                    if(!post.isDeleted()) {
                        returnPosts.add(post);
                    }
                });

                userProfile.getReposts().forEach(repost -> {
                    Post post = repost.getRePost();
                    returnPosts.remove(post);
                    post.setPostDate(repost.getRepostDate());
                    post.setRepostedBy(userProfile.getUsername());
                    post.setReposted(false);
                    if(!post.isDeleted()) {
                        returnPosts.add(post);
                    }
                });
            }
            else {
                //add just the liked posts
                returnPosts = new ArrayList<>();
                userProfile.getLikedPosts().forEach(post -> {
                    if(!post.isDeleted()) {
                        returnPosts.add(post);
                    }
                });
            }

            returnPosts.forEach(post -> {
                post.setLiked(false);
            });
        }

        //ordering posts
        returnPosts.sort(Comparator.comparing(Post::getPostDate,(post1, post2) -> {
            return post2.compareTo(post1);
        }));

        ArrayList<PostDTO> postDTOArray = new ArrayList<>();

        returnPosts.forEach(post -> {
            PostDTO postDTO = new PostDTO();
            postDTO.setContent(post.getContent());
            postDTO.setPostDate(post.getPostDate());
            postDTO.setReposted(post.getReposted());
            postDTO.setLiked(post.getLiked());
            postDTO.setRepostedBy(post.getRepostedBy());
            postDTO.setReposts(post.getReposts());
            postDTO.setReplyTo(post.getReplyTo());
            postDTO.setAuthor(post.getAuthor());
            postDTO.setId(post.getId());
            postDTO.setComments(post.getComments());
            postDTO.setLikes(post.getLikes());
            postDTO.setDeleted(post.isDeleted());
            postDTO.setPpCDNLink(post.getAuthor().getPpCDNLink());
            postDTOArray.add(postDTO);
        });
        //probably smarter to only add profile data to posts that have paginated not every post to make loading faster

        PaginatedList<PostDTO> paginatedList = new PaginatedList<>(postDTOArray);

        return new ProfileDetails(username,
                userProfile.getFullName(),
                userProfile.getBio(),
                isFollowed,
                paginatedList.getPage(pageNum),
                userProfile.getFollowers().size(),
                userProfile.getFollowing().size(),
                null,
                followedBy,
                userProfile.getPpCDNLink());
    } //moose

    @Override
    public List<PostDTO> requestTimeline(String email, Integer pageNum){
        List<Post> timeline = new ArrayList<>();
        if(pageNum == null || pageNum == 0) {
            pageNum = 1;
        }

        User user = userRepo.findByEmail(email);

        //following post/repost hydration logic
        List<Followers> followers = followerRepo.findByFrom(user);
        followers.forEach(follower -> follower.getTo().getPosts().forEach(post -> timeline.add(post)));  //add following posts to timeline
        followers.forEach(follower -> follower.getTo().getReposts().forEach(repost -> {
            Post post = repost.getRePost();
            post.setRepostedBy(repost.getRePoster().getUsername());
            post.setPostDate(repost.getRepostDate());
            if(!timeline.contains(post) && !post.isDeleted()) {
                timeline.add(post);
            }
        }));

        //current user post/repost hydration logic
        List<Post> userPosts = postRepo.findByAuthor(user);
        userPosts.forEach(post -> {
            if(!timeline.contains(post) && !post.isDeleted()) {
                timeline.add(post);
            }
        });
        //adding own reposts to timeline
        user.getReposts().forEach(repost -> {
            Post post = repost.getRePost();
            timeline.remove(post);
            post.setPostDate(repost.getRepostDate());
            post.setRepostedBy(user.getUsername());
            post.setReposted(true);
            if(!timeline.contains(repost.getRePost()) && !post.isDeleted()) {
                timeline.add(post);
            }
        });

        //order the posts by newest on top
        timeline.sort(Comparator.comparing(Post::getPostDate,(post1, post2) -> {
            return post2.compareTo(post1);
        }));

        //checking if the current user has liked any posts
        timeline.forEach(post -> {
            if (post.getLikes().contains(user)) {
                post.setLiked(true);
            }
            else {
                post.setLiked(false);
            }
        });

        ArrayList<PostDTO> postDTOArray = new ArrayList<>();

        timeline.forEach(post -> {
            PostDTO postDTO = new PostDTO();
            postDTO.setContent(post.getContent());
            postDTO.setPostDate(post.getPostDate());
            postDTO.setReposted(post.getReposted());
            postDTO.setLiked(post.getLiked());
            postDTO.setRepostedBy(post.getRepostedBy());
            postDTO.setReposts(post.getReposts());
            postDTO.setReplyTo(post.getReplyTo());
            postDTO.setAuthor(post.getAuthor());
            postDTO.setId(post.getId());
            postDTO.setComments(post.getComments());
            postDTO.setLikes(post.getLikes());
            postDTO.setDeleted(post.isDeleted());
            postDTO.setPpCDNLink(post.getAuthor().getPpCDNLink()); //add this line to every postDTO
            postDTOArray.add(postDTO);
        });
        //instead of writing this code 4 separate times you couldve just wrote 1 util method
        /* for performance reasons you should only be doing this for paginated posts not all the posts,
        if you do it for all posts it could take a long time to load someone who has a lot of posts profile */

        PaginatedList<PostDTO> paginatedList = new PaginatedList<>(postDTOArray);

        //check if the post is a reply first by checking if replyTo is null or not
        return paginatedList.getPage(pageNum);
        //this strategy works but, it might be slow if someone has a bunch of posts
    }

    @Override
    public String addFollower(String username, String email) { //username is from the person getting followed, email is the followers email
        User recipient = userRepo.findByUsername(username); //to / getting followed
        User agent = userRepo.findByEmail(email); //from / doing the following

        //if the server goes down and you need to relog
        if(agent == null) {
            return "login";
        }
        Notification notification = notificationRepo.findFollow("follow",recipient, agent);

        //checks to see if you are following the current user and if you are, it unfollows
        List<Followers> followers = agent.getFollowing();
        for(Followers user : followers) {
            if(user.getTo() == recipient) {
                if(notification != null) {
                    notificationRepo.delete(notification);
                }
                followerRepo.delete(user);
                return "failure";
            }
        }

        createNotification(agent, "follow", null, recipient, null);
        //if you are not following, this logic does the following
        Followers follower = new Followers(
                agent,
                recipient
        );
        followerRepo.save(follower);

        return "success"; //user followed successfully
    }

    @Override
    public Post addPost(PostModel postModel, User author, Long targetId) {
        if(postModel.getContent() == "" || author.equals(null)) {
            return null;
        }
        Post post = new Post(author, postModel.getContent());
        postRepo.save(post);
        if(targetId == null) {
            return post;
        }
        //create a notif for when a user replies to another users post moose
        Post originalPost = postRepo.getReferenceById(targetId);
        if(!originalPost.getAuthor().getUsername().equalsIgnoreCase(author.getUsername())) {
            createNotification(post.getAuthor(), "reply", post, originalPost.getAuthor(), postModel.getContent());
        }
        originalPost.addReplyToComments(post); //adding comment to post
        post.setReplyTo(originalPost); //expressing that this post is a comment
        postRepo.save(post);
        postRepo.save(originalPost);
        return post;
    }

    @Override
    public List<User> addPostToLikes(Long id, String email) {
        Post post = postRepo.getReferenceById(id);
        User currentUser = userRepo.findByEmail(email);
        User receiver = post.getAuthor();
        Notification notification = notificationRepo.findExact("like",post.getAuthor(), currentUser,post);

        //checking if the user has already liked the post
        if(currentUser.getLikedPosts().contains(post)) {
            if(notification != null) {
                notificationRepo.delete(notification);
            }
            currentUser.getLikedPosts().remove(post);
            userRepo.save(currentUser);
            return post.getLikes();
        }
        if(!currentUser.equals(post.getAuthor())) {
            createNotification(currentUser, "like", post, post.getAuthor(), null);
        }
        currentUser.addToLikes(post);
        userRepo.save(currentUser);

        return post.getLikes();

    }

    @Override
    public Set<Repost> addPostToReposts(Long id, String email) {
        Post post = postRepo.getReferenceById(id);
        User user = userRepo.findByEmail(email); //currentUser
        User receiver = post.getAuthor();
        Notification notification = notificationRepo.findExact("repost", post.getAuthor(), user, post);
        //add notification logic

        //checking if user has already reposted the post
        for(Repost re : user.getReposts()) {
            if(re.getRePost().equals(post) && re.getRePoster().equals(user)) {
                if(notification != null) {
                    notificationRepo.delete(notification);
                }
                repostRepo.delete(re);
                user.getReposts().remove(re);
                userRepo.save(user);
                post.setReposts(post.getReposts()-1);
                postRepo.save(post);
                return repostRepo.findByRePost(post);
            }
        }
        if(!user.equals(post.getAuthor())) {
            createNotification(user, "repost", post, post.getAuthor(), null);
        }
        Repost repost = new Repost(user, post); //reposter and repost
        user.addPostToReposts(repost);
        userRepo.save(user);
        repostRepo.save(repost);
        post.setReposts(post.getReposts()+1);
        postRepo.save(post);

        return repostRepo.findByRePost(post);

    }

    @Override
    public List<User> getFollowers(String username, String email, Integer pageNum) { //username -> profile, email -> current user
        User userProfile = userRepo.findByUsername(username);
        User currentUser = userRepo.findByEmail(email);

        ArrayList<User> followers = new ArrayList<>();

        userProfile.getFollowers().forEach(follower -> {
            followers.add(follower.getFrom());
        });

        if(currentUser == null) {
            PaginatedList<User> paginatedList = new PaginatedList<>(followers);
            return paginatedList.getPage(pageNum);
        }

        currentUser.getFollowing().forEach(follow -> {
            if(followers.contains(follow.getTo())) {
                User user = follow.getTo();
                followers.remove(user);
                user.setFollowed(true);
                followers.add(user);
            }
        });

        PaginatedList<User> paginatedList = new PaginatedList<>(followers);
        return paginatedList.getPage(pageNum);
    }

    @Override
    public List<User> getFollowing(String username, String email, Integer pageNum) {
        User userProfile = userRepo.findByUsername(username);
        User currentUser = userRepo.findByEmail(email);

        ArrayList<User> following = new ArrayList<>();

        userProfile.getFollowing().forEach(follower -> {
            following.add(follower.getTo());
        });

        if(currentUser == null) {
            PaginatedList<User> paginatedList = new PaginatedList<>(following);
            return paginatedList.getPage(pageNum);
        }

        currentUser.getFollowing().forEach(follow -> {
            if(following.contains(follow.getTo())) {
                User user = follow.getTo();
                following.remove(user);
                user.setFollowed(true);
                following.add(user);
            }
        });

        PaginatedList<User> paginatedList = new PaginatedList<>(following);
        return paginatedList.getPage(pageNum);
    }

    @Override
    public List<PostDTO> getPost(Long id, User currentUser) {
        //check if the author of the original post is the same as the commenter, if they are the same then ->
        //figure out how to display those first? (Maybe not a good idea/not worth the effort)
        List<Post> thread = new ArrayList<>();
        List<PostDTO> returnPosts = new ArrayList<>();
        Post targetPost = postRepo.getReferenceById(id); //getting post
        targetPost.setFocus(true);
        thread.add(targetPost);

        //checks if this post is a reply post
        if(targetPost.getReplyTo() != null) {
            //adds all the previous posts to the thread
            while(true) {
                if(thread.get(0).getReplyTo() == null) {
                    break;
                }
                Post replyTo = thread.get(0).getReplyTo();
                replyTo.setFocus(false);
                thread.add(0, replyTo);
            }
        }

        if(currentUser == null) { //checking if user is logged in and runs if not
            thread.forEach(post -> {
                PostDTO postDTO = new PostDTO();
                postDTO.setContent(post.getContent());
                postDTO.setPostDate(post.getPostDate());
                postDTO.setReposted(post.getReposted());
                postDTO.setLiked(post.getLiked());
                postDTO.setRepostedBy(post.getRepostedBy());
                postDTO.setReposts(post.getReposts());
                postDTO.setReplyTo(post.getReplyTo());
                postDTO.setAuthor(post.getAuthor());
                postDTO.setId(post.getId());
                postDTO.setLikes(post.getLikes());
                postDTO.setFocus(post.getFocus());
                postDTO.setComments(post.getComments());
                postDTO.setDeleted(post.isDeleted());
                postDTO.setPpCDNLink(post.getAuthor().getPpCDNLink());
                postDTO.getComments().forEach(comment -> {
                    PostDTO commentDTO = new PostDTO();
                    commentDTO.setContent(comment.getContent());
                    commentDTO.setPostDate(comment.getPostDate());
                    commentDTO.setReposted(comment.getReposted());
                    commentDTO.setLiked(comment.getLiked());
                    commentDTO.setRepostedBy(comment.getRepostedBy());
                    commentDTO.setReposts(comment.getReposts());
                    commentDTO.setReplyTo(comment.getReplyTo());
                    commentDTO.setAuthor(comment.getAuthor());
                    commentDTO.setId(comment.getId());
                    commentDTO.setLikes(comment.getLikes());
                    commentDTO.setFocus(comment.getFocus());
                    commentDTO.setDeleted(comment.isDeleted());
                    commentDTO.setComments(comment.getComments());
                    commentDTO.setPpCDNLink(comment.getAuthor().getPpCDNLink());
                    postDTO.addToReplies(commentDTO);
                });

                returnPosts.add(postDTO);
            });
            return returnPosts;
        }

        List<Post> userLikes = currentUser.getLikedPosts();
        List<Post> userReposts = new ArrayList<>();

        //hydrating the reposts array
        currentUser.getReposts().forEach(repost -> {
            userReposts.add(repost.getRePost());
        });

        //-------thread logic-----
        //check if main post reposted by any of current Users following
        currentUser.getFollowing().forEach(follower -> follower.getTo().getReposts().forEach(repost -> {
            if(repost.getRePost().equals(targetPost)) {
                targetPost.setRepostedBy(follower.getTo().getUsername());
            }
        }));

        //check if main post reposted by currentUser(overrides the previous logic)
        userReposts.forEach(repost -> {
            if(repost.equals(targetPost)) {
                targetPost.setRepostedBy(currentUser.getUsername());
                targetPost.setReposted(true);
            }
        });

        //check if main post liked
        if(userLikes.contains(targetPost)) {
            targetPost.setLiked(true);
        }
        //check if any post in the thread has been liked/reposted
        thread.forEach(post -> {
            if(userLikes.contains(post)) {
                post.setLiked(true);
            }
            if(userReposts.contains(post)) {
                post.setReposted(true);
            }
        });
        //----------------

        //-------comments logic----

        //check if each comment has been liked/reposted
        targetPost.getComments().forEach(comment -> {
            if(userLikes.contains(comment)) {
                comment.setLiked(true);
            }
            if(userReposts.contains(comment)) {
                comment.setReposted(true);
            }
        });

        thread.forEach(post -> {
            PostDTO postDTO = new PostDTO();
            postDTO.setContent(post.getContent());
            postDTO.setPostDate(post.getPostDate());
            postDTO.setReposted(post.getReposted());
            postDTO.setLiked(post.getLiked());
            postDTO.setRepostedBy(post.getRepostedBy());
            postDTO.setReposts(post.getReposts());
            postDTO.setReplyTo(post.getReplyTo());
            postDTO.setAuthor(post.getAuthor());
            postDTO.setId(post.getId());
            postDTO.setLikes(post.getLikes());
            postDTO.setFocus(post.getFocus());
            postDTO.setDeleted(post.isDeleted());
            postDTO.setComments(post.getComments());
            postDTO.setPpCDNLink(post.getAuthor().getPpCDNLink());
            postDTO.getComments().forEach(comment -> {
                PostDTO commentDTO = new PostDTO();
                commentDTO.setContent(comment.getContent());
                commentDTO.setPostDate(comment.getPostDate());
                commentDTO.setReposted(comment.getReposted());
                commentDTO.setLiked(comment.getLiked());
                commentDTO.setRepostedBy(comment.getRepostedBy());
                commentDTO.setReposts(comment.getReposts());
                commentDTO.setReplyTo(comment.getReplyTo());
                commentDTO.setAuthor(comment.getAuthor());
                commentDTO.setId(comment.getId());
                commentDTO.setLikes(comment.getLikes());
                commentDTO.setFocus(comment.getFocus());
                commentDTO.setDeleted(comment.isDeleted());
                commentDTO.setComments(comment.getComments());
                commentDTO.setPpCDNLink(comment.getAuthor().getPpCDNLink());
                postDTO.addToReplies(commentDTO);
                //i did this in the most inefficient way possible but it works, make a UTIL method for converting post to DTO
            });
            returnPosts.add(postDTO);
        });
        //having a non focused post being set to focused should be fixed
        return returnPosts;
    }

    @Override
    public List<User> getPostInteractions(Long postId, String interaction, User currentUser, Integer page) {
        Post post = postRepo.getReferenceById(postId);
        List<User> likers = post.getLikes();
        List<User> reposters = new ArrayList<>();
        List<User> following = new ArrayList<>();

        repostRepo.findByRePost(post).forEach(repost -> {
            User user = repost.getRePoster();
            reposters.add(user);
        });

        if(currentUser == null) {
            if(interaction.equalsIgnoreCase("likes")) {
                PaginatedList paginatedList = new PaginatedList(likers);
                return paginatedList.getPage(page);
            }
            else {
                PaginatedList paginatedList = new PaginatedList(reposters);
                return paginatedList.getPage(page);
            }
        }

        //hydrating the following array we use for comparing
        currentUser.getFollowing().forEach(user -> {
            following.add(user.getTo());
        });

        //this block checks if we follow any of the people who like the post
        if(interaction.equalsIgnoreCase("likes")) {
            likers.forEach(user -> {
                if(following.contains(user)) {
                    user.setFollowed(true);
                }
            });
            PaginatedList paginatedList = new PaginatedList((List) likers);
            return paginatedList.getPage(page);
        }
        //this block checks if we follow any of the people who repost the post
        else {
            reposters.forEach(user -> {
                if(following.contains(user)) {
                    user.setFollowed(true);
                }
            });
            PaginatedList paginatedList = new PaginatedList((List) reposters);
            return paginatedList.getPage(page);
        }
    }

    @Override
    public Notification createNotification(User agent, String action, Post content, User userTo, String comment) {
        //call this method everytime a post is liked, reposted, commented on OR if user is followed
        Notification notification = new Notification();
        notification.setAction(action); //what type of notif (enum)
        notification.setContent(content); //post, this might be null
        notification.setFrom(agent); //who did it
        notification.setTo(userTo);
        notification.setComment(comment);
        notificationRepo.save(notification);
        if(content == null) {
            userTo.addToNotifications(notification);
        }
        else {
            content.getAuthor().addToNotifications(notification);
        }
        return notification;
    }

    @Override
    public void viewNotifications(User to) {
        List<Notification> notifications = notificationRepo.findByTo(to);
        notifications.forEach(notification -> {
            if(!notification.getAction().equalsIgnoreCase("DM")) {
                notification.setViewed(true);
                notificationRepo.save(notification);
            }
        });
        //maybe return back notifications?
    }

    @Override
    public List<Notification> getNotifications(String email, Boolean exact, Integer page) {
        User user = userRepo.findByEmail(email);
        if(user == null) {
            return null;
        }
        List<Notification> notifications = notificationRepo.findByTo(user);

        //this orders the notifs by most recent to least recent
        notifications.sort(Comparator.comparing(Notification::getNotificationDate,(notif1, notif2) -> {
            return notif2.compareTo(notif1);
        }));

        if(exact) {
            notifications.forEach(notification -> {
                notification.setViewed(true);
                notificationRepo.save(notification);
            });
            PaginatedList paginatedList = new PaginatedList(notifications);

            return paginatedList.getPage(page);
        }

        List<Notification> numOfNotifs = new ArrayList<>();
        notifications.forEach(notification -> {
            if(!notification.isViewed()) {
                numOfNotifs.add(notification);
            }
        });

        return numOfNotifs;
    }

    @Override
    public User handleEditProfile(String username, String bio, MultipartFile file, String email) throws IOException {
        User currentUser = userRepo.findByEmail(email);

        if(currentUser == null) {
            return null;
        }
        if(bio != null) {
            currentUser.setBio(bio);
        }
        if(username != null) {
            //not supported, will have to change every instance where you get a user based on their username
            //to get it based on the email
        }

        userRepo.save(currentUser);
        return currentUser;
    }

    @Override
    public String deletePost(Long postID, String email) {
        User user = userRepo.findByEmail(email);
        Optional<Post> optionalPost = postRepo.findById(postID);

        if(optionalPost.isEmpty()) {
            return "does not exist";
        }

        Post post = optionalPost.get();
        if(optionalPost.get().getAuthor().equals(user)) {
            post.setDeleted(true);
            postRepo.save(post);
            return "success";
        }
        return "failure";
    }

    @Override
    public FullResults getFullSearchResults(String keyword, Integer page, String email) {
        FullResults fullResults = new FullResults();
        if (keyword.trim().equalsIgnoreCase("")) {
            return new FullResults();
        }
        fullResults.setUserResults(userSearchResults(keyword, page, email));
        fullResults.setPostResults(postSearchResults(keyword, page, email));

        return fullResults;
    }

    @Override
    public List<User> userSearchResults(String keyword, Integer page, String email) {
        User currentUser = userRepo.findByEmail(email);
        List<User> following = new ArrayList<>();

        if (keyword.trim().equalsIgnoreCase("")) {
            return new ArrayList<>();
        }
        List<User> queryUsers = userRepo.queryUsers(keyword, 100);

        if(currentUser != null) {
            currentUser.getFollowing().forEach(follow -> {
                following.add(follow.getTo());
            });
        }

        queryUsers.forEach(user -> {
            if(following.contains(user)) {
                user.setFollowed(true);
            }
        });

        PaginatedList paginatedList = new PaginatedList(queryUsers);

        return paginatedList.getPage(page);
    }

    @Override
    public List<PostDTO> postSearchResults(String keyword, Integer page, String email) {
        User currentUser = userRepo.findByEmail(email);

        if (keyword.trim().equalsIgnoreCase("")) {
            return new ArrayList<>();
        }
        List<Post> queryPosts = postRepo.queryPosts(keyword);
        ArrayList<PostDTO> postDTOArray = new ArrayList<>();

        if(currentUser != null) {
            currentUser.getReposts().forEach(repost -> {
                if(queryPosts.contains(repost.getRePost())) {
                    repost.getRePost().setReposted(true);
                }
            });
            currentUser.getLikedPosts().forEach(post -> {
                if(queryPosts.contains(post)) {
                    post.setLiked(true);
                }
            });
        }
        else {
            queryPosts.forEach(post -> {
                post.setLiked(false);
                post.setReposted(false);
            });
        }

        queryPosts.forEach(post -> {
            if(!post.isDeleted()) {
                PostDTO postDTO = new PostDTO();
                postDTO.setContent(post.getContent());
                postDTO.setPostDate(post.getPostDate());
                postDTO.setReposted(post.getReposted());
                postDTO.setLiked(post.getLiked());
                postDTO.setRepostedBy(post.getRepostedBy());
                postDTO.setReposts(post.getReposts());
                postDTO.setReplyTo(post.getReplyTo());
                postDTO.setAuthor(post.getAuthor());
                postDTO.setId(post.getId());
                postDTO.setComments(post.getComments());
                postDTO.setLikes(post.getLikes());
                postDTO.setDeleted(post.isDeleted());
                postDTO.setPpCDNLink(post.getAuthor().getPpCDNLink());
                postDTOArray.add(postDTO);
            }
        });
        //order the posts by newest on top
        postDTOArray.sort(Comparator.comparing(Post::getPostDate,(post1, post2) -> {
            return post2.compareTo(post1);
        }));
        PaginatedList paginatedList = new PaginatedList(postDTOArray);

        //paginate this as well
        return paginatedList.getPage(page);
    }
}
