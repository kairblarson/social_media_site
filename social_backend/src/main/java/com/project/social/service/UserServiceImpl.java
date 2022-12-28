package com.project.social.service;

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

import javax.transaction.Transactional;
import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.*;

//i know its bad practice to have one huge service class but i didnt realize how large this was going to be
@Transactional
@Service
public class UserServiceImpl implements UserService {

    @Autowired
    private UserRepo userRepo;
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
    @Lazy
    private PasswordEncoder passwordEncoder;

    @Value("${project.image}")
    private String basePath;

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
    public String processAccount(UserModel userModel) {
        User user = userRepo.findByEmail(userModel.getEmail());

        if(user != null) {
            return "taken";
        }
        if(userModel.getEmail().trim() == "" || userModel.getPassword().trim() == "" || userModel.getFullName().trim() == "") {
            return "null-fields";
        }
        user = new User();
        user.setEnabled(true);
        user.setRole("ROLE_USER");
        user.setPassword(passwordEncoder.encode(userModel.getPassword()));
        user.setProvider(Provider.LOCAL);
        user.setEmail(userModel.getEmail());
        user.setFullName(userModel.getFullName());
        user.setBio(userModel.getBio());

        userRepo.save(user);

        return "Success";
    }

    @Override
    public ProfileDetails getProfileDetails(String username, String email, Integer pageNum, String postType) throws Exception {
        User userProfile = userRepo.findByUsername(username); //details of whos profile we went to
        Optional<User> currentUser = Optional.ofNullable(userRepo.findByEmail(email)); //current user who went to profile
        boolean isFollowed = false;

        if(userProfile == null) {
            throw new Exception("User does not exist");
        }

        //reposts and posts are included in this
        List<Post> returnPosts;

        //checking to see if we follow the user whose profile we are accessing
        if(currentUser.isPresent()) {
            //this condition is checking if we are returning regular posts/reposts
            if(postType.equalsIgnoreCase("posts")) {
                returnPosts = userProfile.getPosts();
                List<Followers> followers = currentUser.get().getFollowing();
                for(Followers follower : followers) {
                    if(follower.getTo() == userProfile) {
                        isFollowed = true;
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
                    returnPosts.add(post);
                });

                //checking if the current user has reposted any of the profiles posts
                currentUser.get().getReposts().forEach(repost -> {
                    Post post = repost.getRePost();
                    if(returnPosts.contains(post)) {
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
                returnPosts = userProfile.getLikedPosts();
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
            currentUsersReposts.forEach(repost -> reposts.add(repost.getRePost()));
            returnPosts.forEach(post -> {
                if(reposts.contains(post)) {
                    post.setReposted(true);
                }
            });

        }
        else {
            //if there is no current user then there obviously they havent reposted/liked anything
            if(postType.equalsIgnoreCase("posts")) {
                returnPosts = userProfile.getPosts();

                userProfile.getReposts().forEach(repost -> {
                    Post post = repost.getRePost();
                    returnPosts.remove(post);
                    post.setPostDate(repost.getRepostDate());
                    post.setRepostedBy(userProfile.getUsername());
                    post.setReposted(false);
                    returnPosts.add(post);
                });
            }
            else {
                //add just the liked posts
                returnPosts = userProfile.getLikedPosts();
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
            File imagePath = new File(basePath+"\\"+post.getAuthor().getProfilePicture());
            try{
                if(imagePath != null) {
                    if(imagePath.exists()) {
                        postDTO.setProfPicBytes(FileUtil.readAsByteArray(imagePath));
                    }
                }
            }catch (Exception e) {
                System.out.println("CAUGHT!: "+e.getLocalizedMessage());
            }
            postDTOArray.add(postDTO);
        });
        //refactor to send over postDTO instead
        //you will have to set each property manually unfortunately, but it should work

        PaginatedList<PostDTO> paginatedList = new PaginatedList<>(postDTOArray);
        File imgFile = new File(basePath+"\\"+userProfile.getProfilePicture());
        System.out.println("LOADED RESOURCE: "+imgFile);
        //StreamUtils.copyToByteArray(imgFile.getInputStream())

        if(userProfile.getProfilePicture() != null) {
            if(imgFile.exists()) {
                System.out.println("IMG PATH FOUND");
                return new ProfileDetails(username,
                        userProfile.getFullName(),
                        userProfile.getBio(),
                        isFollowed,
                        paginatedList.getPage(pageNum),
                        userProfile.getFollowers().size(),
                        userProfile.getFollowing().size(),
                        FileUtil.readAsByteArray(imgFile)); //THIS IS WHERE YOU ADD PROF PIC WHEN GETTING PROFILE
            }
        }

        System.out.println("IMG PATH NOT FOUND");
        return new ProfileDetails(username,
                userProfile.getFullName(),
                userProfile.getBio(),
                isFollowed,
                paginatedList.getPage(pageNum),
                userProfile.getFollowers().size(),
                userProfile.getFollowing().size(),
                null); //THIS IS WHERE YOU ADD PROF PIC WHEN GETTING PROFILE
    } //moose

    @Override
    public List<Post> requestTimeline(String email, Integer pageNum){
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
            if(!timeline.contains(post)) {
                timeline.add(post);
            }
        }));

        //current user post/repost hydration logic
        List<Post> userPosts = postRepo.findByAuthor(user);
        userPosts.forEach(post -> {
            if(!timeline.contains(post)) {
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
            if(!timeline.contains(repost.getRePost())) {
                timeline.add(post);
            }
        });

        //order the posts by newest on top
        timeline.sort(Comparator.comparing(Post::getPostDate,(post1, post2) -> {
            return post2.compareTo(post1);
        }));

        PaginatedList<Post> paginatedList = new PaginatedList<>(timeline);

        //checking if the current user has liked any posts
        paginatedList.getPage(pageNum).forEach(post -> {
            if (post.getLikes().contains(user)) {
                post.setLiked(true);
            }
            else {
                post.setLiked(false);
            }
        });

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
        Notification notification = notificationRepo.findExact("follow", agent, null);

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

        createNotification(agent, "follow", null, recipient);
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
        Post post = new Post(author, postModel.getContent());
        postRepo.save(post);
        if(targetId == null) { //if there is no target id(origin comment) return it
            return post;
        }
        //create a notif for when a user replies to another users post
        Post originalPost = postRepo.getReferenceById(targetId);
        originalPost.addReplyToComments(post); //adding comment to post
        post.setReplyTo(originalPost); //expressing that this post is a comment
        postRepo.save(post);
        postRepo.save(originalPost);
        return null;
    }

    @Override
    public Set<User> addPostToLikes(Long id, String email) {
        Post post = postRepo.getReferenceById(id);
        User currentUser = userRepo.findByEmail(email);
        User receiver = post.getAuthor();
        Notification notification = notificationRepo.findExact("like",currentUser,post);

        //checking if the user has already liked the post
        if(currentUser.getLikedPosts().contains(post)) {
            if(notification != null) {
                notificationRepo.delete(notification);
            }
            currentUser.getLikedPosts().remove(post);
            userRepo.save(currentUser);
            return post.getLikes();
        }
        if(currentUser.equals(post.getAuthor())) {
            //put the below code here in production but its okay for testing
        }
        createNotification(currentUser, "like", post, post.getAuthor());
        currentUser.addToLikes(post);
        userRepo.save(currentUser);

        return post.getLikes();

    }

    @Override
    public Set<Repost> addPostToReposts(Long id, String email) {
        Post post = postRepo.getReferenceById(id);
        User user = userRepo.findByEmail(email); //currentUser
        User receiver = post.getAuthor();
        Notification notification = notificationRepo.findExact("repost", user, post);
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
        if(user.equals(post.getAuthor())) {
            //put the below code here in production but its okay for testing
        }
        createNotification(user, "repost", post, post.getAuthor());

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
    public List<Post> getPost(Long id, User currentUser) {
        //check if the author of the original post is the same as the commenter, if they are the same then ->
        //figure out how to display those first? (Maybe not a good idea/not worth the effort)
        List<Post> thread = new ArrayList<>();
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
                thread.add(0, replyTo);
            }
        }

        System.out.println("TARGET POST: "+targetPost);
        System.out.println("REPLY TO POST: "+targetPost.getReplyTo());

        if(currentUser == null) { //checking if user is logged in
            return thread;
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
        return thread;
    }

    @Override
    public Set<User> getPostInteractions(Long postId, String interaction, User currentUser) {
        Post post = postRepo.getReferenceById(postId);
        Set<User> likers = post.getLikes();
        Set<User> reposters = new HashSet<>();
        Set<User> following = new HashSet<>();

        repostRepo.findByRePost(post).forEach(repost -> {
            reposters.add(repost.getRePoster());
        });
        if(currentUser == null) {
            if(interaction.equalsIgnoreCase("likes")) {
                return likers;
            }
            else {
                return reposters;
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
            return likers;
        }
        //this block checks if we follow any of the people who repost the post
        else {
            reposters.forEach(user -> {
                if(following.contains(user)) {
                    user.setFollowed(true);
                }
            });
            return reposters;
        }
    }

    @Override
    public Notification createNotification(User agent, String action, Post content, User userTo) {
        //call this method everytime a post is liked, reposted, commented on OR if user is followed
        Notification notification = new Notification();
        notification.setAction(action); //what type of notif (enum)
        notification.setContent(content); //post, this might be null
        notification.setFrom(agent); //who did it
        notification.setTo(userTo);
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
            notificationRepo.delete(notification); //idk if i need to do this, test if this is necessary or not
            notification.setViewed(true);
            notificationRepo.save(notification);
        });
        //maybe return back notifications?
    }

    @Override
    public List<Notification> getNotifications(String email, Boolean exact) {
        User user = userRepo.findByEmail(email);
        if(user == null) {
            return null;
        }
        List<Notification> notifications = notificationRepo.findByTo(user);

        //might want to paginate this
        //this orders the notifs by most recent to least recent
        notifications.sort(Comparator.comparing(Notification::getNotificationDate,(notif1, notif2) -> {
            return notif2.compareTo(notif1);
        }));

        if(exact) {
            notifications.forEach(notification -> {
                notification.setViewed(true);
                notificationRepo.save(notification);
            });
            return notifications;
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
        if(file != null) {
            if(!file.isEmpty()) {
                //file name
                String name = file.getOriginalFilename();

                //generate random string
                String randomID = UUID.randomUUID().toString();
                //adds random uuid before .jpg/.png
                String newFileName = randomID.concat(name.substring(name.lastIndexOf(".")));

                //adds a slash between filepath and the file w/ new name
                String filePath = basePath+"/"+newFileName;

                //creates images folder in project
                File f = new File(basePath);
                if(!f.exists()) {
                    f.mkdir();
                    System.out.println("DIR CREATED AT: "+basePath);
                }

                //this sets the file into the file path
                Files.copy(file.getInputStream(), Paths.get(filePath));
                System.out.println("FILE STREAM PLACED HERE: "+Paths.get(filePath));

                //sets the profile picture path for the user
                currentUser.setProfilePicture(newFileName);
                System.out.println("FILE NAME SAVED TO USER: "+filePath);
                //moose
            }
        }
        userRepo.save(currentUser);
        return currentUser;
    }
}
