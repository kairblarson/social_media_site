package com.project.social.dto;

import com.project.social.entity.Post;

public class PostDTO extends Post {

    private byte[] profPicBytes;

    public byte[] getProfPicBytes() {
        return profPicBytes;
    }

    public void setProfPicBytes(byte[] profPicBytes) {
        this.profPicBytes = profPicBytes;
    }
}
