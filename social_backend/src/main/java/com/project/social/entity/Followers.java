package com.project.social.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;

import javax.persistence.*;
import javax.validation.constraints.NotNull;


@Entity
@NoArgsConstructor
@AllArgsConstructor
public class Followers {

    @Id
    @GeneratedValue(strategy= GenerationType.AUTO)
    private long id;

    @ToString.Exclude
    @JsonIgnoreProperties({"followers", "following"})
    @ManyToOne
    @JoinColumn(name="from_user_fk")
    private User from;

    @ToString.Exclude
    @JsonIgnoreProperties({"followers", "following"})
    @ManyToOne
    @JoinColumn(name="to_user_fk")
    private User to;

    public Followers(User from, User to) {
        this.from = from;
        this.to = to;
    }

    public long getId() {
        return id;
    }

    public void setId(long id) {
        this.id = id;
    }

    public User getFrom() {
        return from;
    }

    public void setFrom(User from) {
        this.from = from;
    }

    public User getTo() {
        return to;
    }

    public void setTo(User to) {
        this.to = to;
    }

    @Override
    public String toString() {
        return "Followers{" +
                "id=" + id +
                ", from=" + from +
                ", to=" + to +
                '}';
    }
}
