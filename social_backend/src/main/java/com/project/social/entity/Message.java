package com.project.social.entity;

import com.project.social.model.Status;
import lombok.*;

import javax.persistence.*;
import java.util.Date;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "messages")
@ToString
public class Message {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;
    @ManyToOne(cascade = CascadeType.MERGE, fetch = FetchType.LAZY)
    @JoinColumn
    private User sender;
    @ManyToOne(cascade = CascadeType.MERGE, fetch = FetchType.LAZY)
    @JoinColumn
    private User receiver;
    private String message;
    private Long messageDate = new Date().getTime();
    private Status status;
    //add a user profile pic with this too


}
