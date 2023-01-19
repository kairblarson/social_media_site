package com.project.social.controller;

import com.project.social.dto.MessageDTO;
import com.project.social.entity.CustomOAuth2User;
import com.project.social.entity.CustomUserDetails;
import com.project.social.entity.User;
import com.project.social.repo.UserRepo;
import com.project.social.service.MessageService;
import org.aspectj.util.FileUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;

import java.io.File;
import java.util.HashMap;
import java.util.List;

@Controller
public class ChatController {

    @Autowired
    private SimpMessagingTemplate simpMessagingTemplate;
    @Autowired
    private MessageService messageService;
    @Autowired
    private UserRepo userRepo;
    @Value("${project.image}")
    private String basePath;

    //public chat room for everyone
    @MessageMapping("/message")
    @SendTo("/chatroom/public")
    private MessageDTO receivePublicMessage(@Payload MessageDTO messageDTO) {
//        System.out.println("PUBLIC MESSAGE: "+messageDTO);
        return messageDTO;
    }

    //logic for sending messages to specific people
    @MessageMapping("/private-message")
    public MessageDTO receivePrivateMessage(@Payload MessageDTO messageDTO,
                                            Authentication authentication) {

//        System.out.println("PRIVATE MESSAGE: "+messageDTO);
        messageService.handleMessage(messageDTO, getEmailFromAuth(authentication));
        //these are dynamic topics

        //this only works for loading messages someone sends you
        File imagePath = new File(basePath+"\\"+userRepo.findByUsername(messageDTO.getSenderName()).getProfilePicture());
        try{
            if(imagePath != null) {
                if(imagePath.exists()) {
                    messageDTO.setProfilePicture(FileUtil.readAsByteArray(imagePath));
                }
            }
        }catch (Exception e) {
            System.out.println("CAUGHT!: "+e.getLocalizedMessage());
        }
        simpMessagingTemplate.convertAndSendToUser(messageDTO.getReceiverName(), "/private", messageDTO); // /user/{username}/private
        return messageDTO;
    }

    @GetMapping("/messages")
    public ResponseEntity<List<MessageDTO>> getConversations(@RequestParam(value = "target") String targetUser,
                                                             Authentication authentication) {

        return ResponseEntity.ok().body(messageService.getConversations(getEmailFromAuth(authentication), targetUser));
    }

    @GetMapping("/messages/{username}")
    public ResponseEntity<List<MessageDTO>> getChatMessages(@PathVariable(value = "username") String username,
                                                            @RequestParam(value = "page") Integer page,
                                                            Authentication authentication) {

        return ResponseEntity.ok().body(messageService.getChatMessages(getEmailFromAuth(authentication), username, page));
    }

    @GetMapping("/messages/unread")
    public ResponseEntity<HashMap<String,Integer>> getUnreadMessages(Authentication authentication) {

        return ResponseEntity.ok().body(messageService.getUnreadMessages(getEmailFromAuth(authentication)));
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
