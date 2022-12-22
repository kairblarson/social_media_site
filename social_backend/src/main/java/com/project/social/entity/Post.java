package com.project.social.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import org.springframework.lang.Nullable;

import javax.persistence.*;
import java.util.*;

@JsonIgnoreProperties("hibernateLazyInitializer")
@Entity
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "posts")
public class Post {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;
    @ManyToOne(cascade = CascadeType.ALL)
    @JoinColumn(name="author_id", referencedColumnName = "id")
    private User author;
    @ManyToMany(mappedBy = "likedPosts")
    private Set<User> likes;
    @JsonIgnoreProperties("replyTo")
    @ManyToMany
    @JoinTable(name = "comments",
            joinColumns = @JoinColumn(name = "post_id"),
            inverseJoinColumns = @JoinColumn(name = "comment_id"))
    private List<Post> comments;
    @JsonIgnoreProperties({"comments", "replyTo"})
    @OneToOne
    @Nullable
    private Post replyTo;
    private Integer reposts = 0;
    private Boolean isLiked = false;
    private Boolean isReposted = false;
    private String repostedBy;
    private String content;
    private Long postDate = new Date().getTime();
    private Boolean isFocus = false;

    public Post(User author, String content) {
        this.author = author;
        this.content = content;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public User getAuthor() {
        return author;
    }

    public void setAuthor(User author) {
        this.author = author;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public Long getPostDate() {
        return postDate;
    }

    public void setPostDate(Long postDate) {
        this.postDate = postDate;
    }

    public Set<User> getLikes() {
        return likes;
    }

    public void setLikes(Set<User> likes) {
        this.likes = likes;
    }

    public Boolean getLiked() {
        return isLiked;
    }

    public void setLiked(Boolean liked) {
        isLiked = liked;
    }

    public Integer getReposts() {
        return reposts;
    }

    public void setReposts(Integer reposts) {
        this.reposts = reposts;
    }

    public Boolean getReposted() {
        return isReposted;
    }
    public void setReposted(Boolean reposted) {
        isReposted = reposted;
    }

    public String getRepostedBy() {
        return repostedBy;
    }

    public void setRepostedBy(String repostedBy) {
        this.repostedBy = repostedBy;
    }

    public List<Post> getComments() {
        return comments;
    }

    public void setComments(List<Post> comments) {
        this.comments = comments;
    }

    public void addReplyToComments(Post comment) {
        System.out.println("Reply has been added");
        comments.add(comment);
    }

    @Nullable
    public Post getReplyTo() {
        return replyTo;
    }

    public void setReplyTo(@Nullable Post replyTo) {
        this.replyTo = replyTo;
    }

    public Boolean getFocus() {
        return isFocus;
    }

    public void setFocus(Boolean focus) {
        isFocus = focus;
    }

    @Override
    public String toString() {
        return "Post{" +
                "id=" + id +
                ", author=" + author +
                ", content='" + content + '\'' +
                ", postDate=" + postDate +
                ", isFocus=" + isFocus +
                '}';
    }
}
