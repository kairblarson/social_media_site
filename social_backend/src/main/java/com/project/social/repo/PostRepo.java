package com.project.social.repo;

import com.project.social.entity.Post;
import com.project.social.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PostRepo extends JpaRepository<Post, Long> {

    List<Post> findByAuthor(User author);
    @Query(value = "SELECT * FROM posts p WHERE p.content LIKE %:keyword%", nativeQuery = true)
    List<Post> queryPosts(@Param("keyword") String keyword);
}
