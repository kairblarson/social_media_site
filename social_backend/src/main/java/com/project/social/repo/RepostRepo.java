package com.project.social.repo;

import com.project.social.entity.Post;
import com.project.social.entity.Repost;
import com.project.social.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Set;

@Repository
public interface RepostRepo extends JpaRepository<Repost, Long> {

    Post findByRePoster(User rePoster);
    Post findByRePostId(Long id);
    Set<Repost> findByRePost(Post post);
}
