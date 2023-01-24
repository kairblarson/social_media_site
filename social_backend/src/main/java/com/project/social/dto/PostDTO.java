package com.project.social.dto;

import com.project.social.entity.Post;

import java.util.ArrayList;
import java.util.List;

public class PostDTO extends Post {

    private byte[] profPicBytes;
    private List<PostDTO> replies = new ArrayList<>();
    private String ppCDNLink;

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

    public String getPpCDNLink() {
        return ppCDNLink;
    }

    public void setPpCDNLink(String ppCDNLink) {
        this.ppCDNLink = ppCDNLink;
    }
}
