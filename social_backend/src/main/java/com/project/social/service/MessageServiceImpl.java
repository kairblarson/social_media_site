package com.project.social.service;

import com.project.social.dto.MessageDTO;
import com.project.social.entity.Message;
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
import java.util.*;
import java.util.concurrent.atomic.AtomicBoolean;

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

    }

    @Override
    public List<MessageDTO> getConversations(String email, String targetUser) {
        List<String> usernames = new ArrayList<>();
        List<Message> sentMessages = messageRepo.getAllSenderMessages(userRepo.findByEmail(email));
        List<Message> receivedMessages = messageRepo.getAllReceiverMessages(userRepo.findByEmail(email));
        List<MessageDTO> conversations = new ArrayList<>();

        sentMessages.forEach(message -> {
            if(!usernames.contains(message.getReceiver().getUsername())) {
                MessageDTO messageDTO = new MessageDTO();
                messageDTO.setId(message.getId());
                messageDTO.setMessage(message.getMessage());
                messageDTO.setStatus(message.getStatus());
                messageDTO.setMessageDate(message.getMessageDate());
                messageDTO.setSenderName(message.getSender().getUsername());
                messageDTO.setConversationWith(message.getReceiver().getUsername()); //people we have conversation with due to messaging them
                messageDTO.setPpCDNLink(message.getReceiver().getPpCDNLink());
                usernames.add(message.getReceiver().getUsername());
                conversations.add(messageDTO);
            }
            else {
                //do nothing
            }
        });

        receivedMessages.forEach(message -> {
            if (!usernames.contains(message.getSender().getUsername()) || !message.isViewed()) {
                MessageDTO messageDTO = new MessageDTO();
                messageDTO.setId(message.getId());
                messageDTO.setMessage(message.getMessage());
                messageDTO.setStatus(message.getStatus());
                messageDTO.setMessageDate(message.getMessageDate());
                messageDTO.setViewed(message.isViewed());
                messageDTO.setSenderName(message.getSender().getUsername());
                messageDTO.setConversationWith(message.getSender().getUsername()); //people we have conversation with due to them messaging us
                messageDTO.setPpCDNLink(message.getSender().getPpCDNLink());
                usernames.add(message.getSender().getUsername());
                conversations.add(messageDTO);
            }
            else {
                //do nothing
            }
        });

        if(!usernames.contains(targetUser) && userRepo.findByUsername(targetUser) != null) {
            MessageDTO messageDTO = new MessageDTO();
            messageDTO.setMessageDate(new Date().getTime());
            messageDTO.setConversationWith(targetUser);
            messageDTO.setPpCDNLink(userRepo.findByUsername(targetUser).getPpCDNLink());
            conversations.add(messageDTO);
        }

        conversations.sort(Comparator.comparing(MessageDTO::getMessageDate,(msg1, msg2) -> {
            return msg2.compareTo(msg1);
        }));
        return conversations;
    }

    @Override
    public List<MessageDTO> getChatMessages(String email, String username, Integer page) {
        boolean newChat = false;
        User currentUser = userRepo.findByEmail(email);
        User targetUser = userRepo.findByUsername(username);

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
            messageDTO.setPpCDNLink(message.getSender().getPpCDNLink());
            if(message.getReceiver().equals(currentUser)) {
                message.setViewed(true);
                messageRepo.save(message);
                messageDTO.setViewed(true);
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

        return unreadMessages;
    }
}
