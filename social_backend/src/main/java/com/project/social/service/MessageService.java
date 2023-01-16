package com.project.social.service;

import com.project.social.dto.MessageDTO;
import com.project.social.entity.User;

import java.util.HashMap;
import java.util.List;

public interface MessageService {

    public void handleMessage(MessageDTO messageDTO, String senderEmail);
    public List<MessageDTO> getConversations(String email);
    public List<MessageDTO> getChatMessages(String email, String username, Integer page);
    public HashMap<String, Integer> getUnreadMessages(String email);
}
