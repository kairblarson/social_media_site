package com.project.social.controller;

import com.project.social.dto.PostDTO;
import com.project.social.entity.*;
import com.project.social.model.PostModel;
import com.project.social.model.UserModel;
import com.project.social.service.CustomUserDetailsService;
import com.project.social.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;
import java.io.IOException;
import java.util.List;
import java.util.Optional;
import java.util.Set;

@CrossOrigin(origins = "http://localhost:3000", methods = {RequestMethod.OPTIONS, RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE}, allowedHeaders = "*", allowCredentials = "true")
@RestController
public class MainController {

    @Autowired
    private UserService userService;

    @Autowired
    private CustomUserDetailsService service;

    @GetMapping("/getSessionId")
    public ResponseEntity<String> getSessionId() {
        return ResponseEntity.ok().body("REDIRECT");
    }

    @GetMapping("/successful-login")
    public ResponseEntity<Object> successfulLogin(Authentication authentication) {
        return ResponseEntity.ok().body(authentication);
    }

    @GetMapping("/successful-logout")
    public ResponseEntity<Object> successfulLogout(HttpSession session,
                                                   Authentication authentication,
                                                   HttpServletRequest request,
                                                   HttpServletResponse response) {
        Cookie[] cookies = request.getCookies();
        if (cookies != null)
            for (Cookie cookie : cookies) {
                cookie.setValue("");
                cookie.setPath("/");
                cookie.setMaxAge(0);
                response.addCookie(cookie);
            }
        System.out.println("LOGOUT");
        System.out.println("CONTEXT HOLDER: "+SecurityContextHolder.getContext());
        return ResponseEntity.ok().body(HttpServletResponse.SC_ACCEPTED);
    }

    @GetMapping("/{username}/posts")
    public ResponseEntity<ProfileDetails> getProfileDetails(@PathVariable(value = "username") String username,
                                                            @RequestParam(value = "page") Integer pageNum,
                                                            Authentication authentication) throws Exception {
        String email = getEmailFromAuth(authentication);
        return ResponseEntity.ok().body(userService.getProfileDetails(username, email, pageNum, "posts"));
    }

    @GetMapping("/{username}/likes") //you can combine this method and the one above into one
    public ResponseEntity<ProfileDetails> getProfileLikes(@PathVariable(value = "username") String username,
                                                            @RequestParam(value = "page") Integer pageNum,
                                                            Authentication authentication) throws Exception {
        String email = getEmailFromAuth(authentication);
        return ResponseEntity.ok().body(userService.getProfileDetails(username, email, pageNum, "likes"));
    }

    @PostMapping("/process-post")
    public ResponseEntity<Post> createPost(@RequestBody PostModel postModel,
                                           Authentication authentication,
                                           @RequestParam(value = "targetId", required = false) Long targetId) {
        Post post = userService.addPost(postModel, userService.findByEmail(getEmailFromAuth(authentication)), targetId);
        return ResponseEntity.ok().body(post);
    }

    @GetMapping("/request-timeline")
    public ResponseEntity<List<PostDTO>> requestTimeline(@RequestParam(value = "page", required = false) Integer pageNum,
                                                         Authentication authentication) throws IOException {
        if(authentication == null) {
            System.out.println("RE DIRECT");
            return ResponseEntity.badRequest().body(null);
        }

        return ResponseEntity.ok().body(userService.requestTimeline(getEmailFromAuth(authentication), pageNum));
    }

    @GetMapping("/{username}/follow")
    public ResponseEntity<String> handleFollow(@PathVariable(value = "username") String username, Authentication authentication) {
        return ResponseEntity.ok().body(userService.addFollower(username, getEmailFromAuth(authentication)));
    }

    @GetMapping("/isAuth")
    public ResponseEntity<Object> isAuth(Authentication authentication) {
        if(authentication == null) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok().body(authentication);
    }

    @PostMapping("/handle-like")
    public ResponseEntity<Set<User>> handleLike(@RequestParam(value = "id") Long id,
                                                Authentication authentication,
                                                HttpServletResponse response) {
        if(authentication == null) {
            System.out.println("RE DIRECT");
            return ResponseEntity.badRequest().body(null);
        }
        Set<User> likes = userService.addPostToLikes(id, getEmailFromAuth(authentication));
        return ResponseEntity.ok().body(likes);
    }

    @PostMapping("/handle-repost")
    public ResponseEntity<Integer> handleRepost(@RequestParam(value = "id") Long id,
                                                Authentication authentication,
                                                HttpServletResponse response) {
        if(authentication == null) {
            System.out.println("RE DIRECT");
            return ResponseEntity.badRequest().body(null);
        }
        Set<Repost> reposts = userService.addPostToReposts(id, getEmailFromAuth(authentication));
        return ResponseEntity.ok().body(reposts.size());
    }

    @GetMapping("/{username}/followers")
    public ResponseEntity<List<User>> getFollowers(@PathVariable(value = "username") String username,
                                                   @RequestParam(value = "page", required = false) Integer pageNum,
                                                       Authentication authentication) {
        return ResponseEntity.ok().body(userService.getFollowers(username, getEmailFromAuth(authentication), pageNum));
    }
    //probably didnt need 2 diff methods for this but this is easier
    @GetMapping("/{username}/following")
    public ResponseEntity<List<User>> getFollowing(@PathVariable(value = "username") String username,
                                                   @RequestParam(value = "page", required = false) Integer pageNum,
                                                   Authentication authentication) {
        return ResponseEntity.ok().body(userService.getFollowing(username, getEmailFromAuth(authentication), pageNum));
    }

    @GetMapping("/{username}/post/{id}") //this returns you the post
    public ResponseEntity<List<PostDTO>> getPostDetails(@PathVariable(value = "id") Long postId,
                                               Authentication authentication) {
        return ResponseEntity.ok().body(userService.getPost(postId, userService.findByEmail(getEmailFromAuth(authentication))));
    }

    @GetMapping("/{username}/post/{id}/{interaction}")
    public ResponseEntity<Set<User>> getInteractionList(@PathVariable(value = "id") Long postId,
                                                         @PathVariable(value = "interaction") String interaction,
                                                         Authentication authentication) {
        return ResponseEntity.ok().body(userService.getPostInteractions(postId, interaction, userService.findByEmail(getEmailFromAuth(authentication))));
    }

    @GetMapping("/get-notifications")
    public ResponseEntity<List<Notification>> getNotifications(Authentication authentication,
                                                               @RequestParam(value = "exact") Boolean exact) {
        if(authentication == null){
            return ResponseEntity.ok().body(null);
        }
        return ResponseEntity.ok().body(userService.getNotifications(getEmailFromAuth(authentication), exact)); //exact vs relative
    }

    @PostMapping("/{username}/handle-edit")
    public ResponseEntity<User> handleEdit(@RequestPart(value = "username", required = false) String username,
                                           @RequestPart(value = "bio", required = false) String bio,
                                           @RequestPart(value = "profilePicture", required = false) MultipartFile image,
                                           Authentication authentication) {
        try{
            User currentUser = userService.handleEditProfile(username, bio, image, getEmailFromAuth(authentication)); //CHANGE PATH
            return ResponseEntity.ok().body(currentUser);
        } catch (Exception e) {
            System.out.println(e.getLocalizedMessage());
            return ResponseEntity.badRequest().body(null);
        }
    }

    public String getEmailFromAuth(Authentication authentication) {
        String email = null; //code to extract user from auth
        if(authentication == null) {
            return null;
        }
        if(authentication.getPrincipal() instanceof OAuth2User) {
            CustomOAuth2User customOAuth2User = (CustomOAuth2User) authentication.getPrincipal();
            email = customOAuth2User.getEmail();
        }
        else {
            if(authentication.getPrincipal() instanceof UserDetails) {
                CustomUserDetails customUserDetails = (CustomUserDetails) authentication.getPrincipal();
                email = customUserDetails.getEmail();
            }
            else{
                System.out.println("User has not logged in?");
                throw new IllegalStateException("Something went wrong...");
            }
        }
        return email;
    }

}
//do not forget to add a new endpoint to the WHITE_LIST_URLS in the security config