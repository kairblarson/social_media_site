package com.project.social.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.NoArgsConstructor;
import lombok.ToString;

import javax.persistence.*;
import java.util.Date;

@Entity
@NoArgsConstructor
@Table(name = "repost")
public class Repost {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;
    @ToString.Exclude
    @JsonIgnoreProperties({"posts", "likedPosts", "repostedPosts", "reposts", "comments"})
    @ManyToOne
    @JoinColumn(name="reposter_id")
    private User rePoster;
    @ManyToOne
    @JoinColumn(name = "reposted_post_id")
    @JsonIgnoreProperties("author")
    private Post rePost;
    private Long repostDate = new Date().getTime();

    public Repost(User rePoster, Post rePost) {
        this.rePoster = rePoster;
        this.rePost = rePost;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public User getRePoster() {
        return rePoster;
    }

    public void setRePoster(User rePoster) {
        this.rePoster = rePoster;
    }

    public Long getRepostDate() {
        return repostDate;
    }

    public void setRepostDate(Long repostDate) {
        this.repostDate = repostDate;
    }

    public Post getRePost() {
        return rePost;
    }

    public void setRePost(Post rePost) {
        this.rePost = rePost;
    }

    @Override
    public String toString() {
        return "Repost{" +
                "id=" + id +
                ", rePoster=" + rePoster +
                ", repostDate=" + repostDate +
                '}';
    }
}
