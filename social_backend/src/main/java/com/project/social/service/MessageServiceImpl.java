package com.project.social.service;

import com.project.social.dto.MessageDTO;
import com.project.social.entity.Message;
import com.project.social.entity.User;
import com.project.social.model.Status;
import com.project.social.repo.MessageRepo;
import com.project.social.repo.UserRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class MessageServiceImpl implements MessageService{

    @Autowired
    private MessageRepo messageRepo;
    @Autowired
    private UserRepo userRepo;

    @Override
    public void handleMessage(MessageDTO messageDTO, String senderEmail) {
        Message message = new Message();
        message.setMessage(messageDTO.getMessage());
        message.setReceiver(userRepo.findByUsername(messageDTO.getReceiverName()));
        message.setSender(userRepo.findByEmail(senderEmail));
        message.setStatus(Status.MESSAGE);
        messageRepo.save(message);
    }

    @Override
    public List<MessageDTO> getUserMessages(String email) {
        //this will be for the left-hand side to display the different users you have messaged or received a message from
        //a different method will be used to actually get the messages between you and another person
        List<Message> sentMessages = messageRepo.getAllSenderMessages(userRepo.findByEmail(email));
        List<Message> receivedMessages = messageRepo.getAllReceiverMessages(userRepo.findByEmail(email));
        sentMessages.forEach(message -> {
            System.out.println("SENT MESSAGE: "+message);
        });
        return null;
    }

    @Override
    public List<MessageDTO> getChatMessages(String email, String username) {
        User currentUser = userRepo.findByEmail(email);
        User targetUser = userRepo.findByUsername(username);

        //cool this works you just have to paginate, reorder by date and add a profile pic and send over the dto 
        List<Message> chat = messageRepo.getChatMessages(currentUser, targetUser);
        chat.forEach(message -> {
            System.out.println("MESSAGE: "+message);
        });
        return null;
    }
}
