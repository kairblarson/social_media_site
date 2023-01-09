package com.project.social.dto;

import com.project.social.entity.User;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class FullResults {

    List<PostDTO> postResults;
    List<User> userResults;
}
