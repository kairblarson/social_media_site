package com.project.social.repo;

import com.project.social.entity.Followers;
import com.project.social.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FollowerRepo extends JpaRepository<Followers, Long> {

    List<Followers> findByFrom(User user);
    List<Followers> findByTo(User user);
}
