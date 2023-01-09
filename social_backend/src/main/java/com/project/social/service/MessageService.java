package com.project.social.service;

import com.project.social.dto.MessageDTO;
import com.project.social.entity.Message;

import java.util.List;

public interface MessageService {

    public void handleMessage(MessageDTO messageDTO, String senderEmail);
    public List<MessageDTO> getUserMessages(String email);
    public List<MessageDTO> getChatMessages(String email, String username);
}
