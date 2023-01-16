package com.project.social.service;

import com.project.social.dto.MessageDTO;
import com.project.social.entity.Message;
import com.project.social.entity.Notification;
import com.project.social.entity.User;
import com.project.social.model.Status;
import com.project.social.repo.MessageRepo;
import com.project.social.repo.NotificationRepo;
import com.project.social.repo.UserRepo;
import com.project.social.wrapper.PaginatedList;
import org.aspectj.util.FileUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.File;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;

@Service
public class MessageServiceImpl implements MessageService{

    @Autowired
    private MessageRepo messageRepo;
    @Autowired
    private UserRepo userRepo;

    @Autowired
    private NotificationRepo notificationRepo;

    @Value("${project.image}")
    private String basePath;

    @Override
    public void handleMessage(MessageDTO messageDTO, String senderEmail) {
        Message message = new Message();
        message.setMessage(messageDTO.getMessage());
        message.setReceiver(userRepo.findByUsername(messageDTO.getReceiverName()));
        message.setSender(userRepo.findByEmail(senderEmail));
        message.setStatus(Status.MESSAGE);
        message.setViewed(false);
        messageRepo.save(message);

//        Notification notification = new Notification();
//        notification.setTo(userRepo.findByUsername(messageDTO.getReceiverName()));
//        notification.setFrom(userRepo.findByEmail(senderEmail));
//        notification.setAction("DM");
//        notificationRepo.save(notification);
    }

    @Override
    public List<MessageDTO> getConversations(String email) {
        //this will be for the left-hand side to display the different users you have messaged or received a message from
        //a different method will be used to actually get the messages between you and another person
        List<Message> sentMessages = messageRepo.getAllSenderMessages(userRepo.findByEmail(email));
        List<Message> receivedMessages = messageRepo.getAllReceiverMessages(userRepo.findByEmail(email));
        List<MessageDTO> conversations = new ArrayList<>();

        sentMessages.forEach(message -> {
            MessageDTO messageDTO = new MessageDTO();
            messageDTO.setId(message.getId());
            messageDTO.setMessage(message.getMessage());
            messageDTO.setStatus(message.getStatus());
            messageDTO.setMessageDate(message.getMessageDate());
            messageDTO.setSenderName(message.getSender().getUsername());
            messageDTO.setConversationWith(message.getReceiver().getUsername()); //people we have conversation with due to messaging them
            File imagePath = new File(basePath+"\\"+message.getReceiver().getProfilePicture());
            try{
                if(imagePath != null) {
                    if(imagePath.exists()) {
                        messageDTO.setProfilePicture(FileUtil.readAsByteArray(imagePath));
                    }
                }
            }catch (Exception e) {
                System.out.println("CAUGHT!: "+e.getLocalizedMessage());
            }
            conversations.add(messageDTO);
        });
        receivedMessages.forEach(message -> {
            MessageDTO messageDTO = new MessageDTO();
            messageDTO.setId(message.getId());
            messageDTO.setMessage(message.getMessage());
            messageDTO.setStatus(message.getStatus());
            messageDTO.setMessageDate(message.getMessageDate());
            messageDTO.setViewed(message.isViewed());
            messageDTO.setSenderName(message.getSender().getUsername());
            messageDTO.setConversationWith(message.getSender().getUsername()); //people we have conversation with due to them messaging us
            File imagePath = new File(basePath+"\\"+message.getSender().getProfilePicture());
            try{
                if(imagePath != null) {
                    if(imagePath.exists()) {
                        messageDTO.setProfilePicture(FileUtil.readAsByteArray(imagePath));
                    }
                }
            }catch (Exception e) {
                System.out.println("CAUGHT!: "+e.getLocalizedMessage());
            }
            conversations.add(messageDTO);
        });

        conversations.sort(Comparator.comparing(MessageDTO::getMessageDate,(msg1, msg2) -> {
            return msg2.compareTo(msg1);
        }));
        return conversations;
    }

    @Override
    public List<MessageDTO> getChatMessages(String email, String username, Integer page) {
        User currentUser = userRepo.findByEmail(email);
        User targetUser = userRepo.findByUsername(username);
//        List<Notification> notifications = notificationRepo.findByTo(userRepo.findByEmail(email));
//        notifications.forEach(notif -> {
//            if(notif.getAction().equalsIgnoreCase("DM") && notif.getFrom().equals(targetUser)) {
//                notif.setViewed(true);
//                notificationRepo.save(notif);
//            }
//        });

        //cool this works you just have to paginate, reorder by date and add a profile pic and send over the dto 
        List<Message> messages = messageRepo.getChatMessages(currentUser, targetUser);
        List<MessageDTO> chat = new ArrayList<>();
        messages.forEach(message -> {
            MessageDTO messageDTO = new MessageDTO();
            messageDTO.setMessage(message.getMessage());
            messageDTO.setStatus(message.getStatus());
            messageDTO.setReceiverName(message.getReceiver().getUsername());
            messageDTO.setSenderName(message.getSender().getUsername());
            messageDTO.setMessageDate(message.getMessageDate());
            messageDTO.setId(message.getId());
            if(message.getReceiver().equals(currentUser)) {
                message.setViewed(true);
                messageRepo.save(message);
                messageDTO.setViewed(true);
            }
            File imagePath = new File(basePath+"\\"+message.getSender().getProfilePicture());
            try{
                if(imagePath != null) {
                    if(imagePath.exists()) {
                        messageDTO.setProfilePicture(FileUtil.readAsByteArray(imagePath));
                    }
                }
            }catch (Exception e) {
                System.out.println("CAUGHT!: "+e.getLocalizedMessage());
            }
            chat.add(messageDTO);
        });

        chat.sort(Comparator.comparing(MessageDTO::getMessageDate,(msg1, msg2) -> {
            return msg2.compareTo(msg1);
        }));

        PaginatedList<MessageDTO> paginatedChat = new PaginatedList<>(chat);

        return paginatedChat.getPage(page);
    }

    @Override
    public HashMap<String, Integer> getUnreadMessages(String email) {
        HashMap<String, Integer> unreadMessages = new HashMap<>();

        List<Message> receivedMessages = messageRepo.getAllReceiverMessages(userRepo.findByEmail(email));

        receivedMessages.forEach(message -> {
            if(!message.isViewed()) {
                if(unreadMessages.containsKey(message.getSender().getUsername())) {
                    unreadMessages.put(message.getSender().getUsername(), unreadMessages.get(message.getSender().getUsername())+1);
                }
                else {
                    unreadMessages.put(message.getSender().getUsername(), 1);
                }
            }
        });
        System.out.println(unreadMessages);
        //THIS SHOULD WORK NOW TEST IT
        return unreadMessages;
    }
}
