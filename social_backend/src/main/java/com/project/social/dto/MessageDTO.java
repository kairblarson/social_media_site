package com.project.social.dto;

import com.project.social.model.Status;
import lombok.*;

import java.util.Date;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class MessageDTO {

    private Long id;
    private String senderName;
    private String receiverName;
    private String message;
    private Long messageDate = new Date().getTime(); //i guess a DTO doesnt really need this
    private Status status;
    private byte[] profilePicture;
    private String conversationWith;
}
