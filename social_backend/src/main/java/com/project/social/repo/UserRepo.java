package com.project.social.repo;

import com.project.social.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface UserRepo extends JpaRepository<User, Long> {

    User findByUsername(String username);
    User findByEmail(String email);
    @Query(value = "SELECT * FROM users u WHERE u.username LIKE %:keyword%", nativeQuery = true)
    List<User> queryUsers(@Param("keyword") String keyword);
}
