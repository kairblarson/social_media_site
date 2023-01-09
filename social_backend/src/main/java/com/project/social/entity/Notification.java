package com.project.social.entity;

import com.project.social.util.NotificationType;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

import javax.persistence.*;
import java.util.Date;

@Entity
@NoArgsConstructor
@Table(name = "notifications")
@Getter
@Setter
@ToString
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;
    private String action;
    @ManyToOne(cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JoinColumn
    private User from;
    @ManyToOne(cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JoinColumn
    private User to;

    private boolean viewed;
    @OneToOne
    @JoinColumn(name = "post_id", referencedColumnName = "id")
    private Post content;
    private Long notificationDate = new Date().getTime();

    public Notification(String action, User from, User to) {
        this.action = action;
        this.from = from;
        this.to = to;
    }

    public Notification(String action, User from, Post content, User to) {
        this.action = action;
        this.from = from;
        this.content = content;
        this.to = to;
    }
}
