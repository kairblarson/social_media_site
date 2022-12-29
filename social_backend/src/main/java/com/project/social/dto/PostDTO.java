package com.project.social.dto;

import com.project.social.entity.Post;

import java.util.ArrayList;
import java.util.List;

public class PostDTO extends Post {

    private byte[] profPicBytes;
    private List<PostDTO> replies = new ArrayList<>();

    public byte[] getProfPicBytes() {
        return profPicBytes;
    }
    public void setProfPicBytes(byte[] profPicBytes) {
        this.profPicBytes = profPicBytes;
    }

    public List<PostDTO> getReplies() {
        return replies;
    }

    public void setReplies(List<PostDTO> replies) {
        this.replies = replies;
    }

    public void addToReplies(PostDTO postDTO) {
        replies.add(postDTO);
    }
}
