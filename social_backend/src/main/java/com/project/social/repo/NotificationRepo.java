package com.project.social.repo;

import com.project.social.entity.Notification;
import com.project.social.entity.Post;
import com.project.social.entity.User;
import com.project.social.util.NotificationType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Set;

import static org.hibernate.loader.Loader.SELECT;

@Repository
public interface NotificationRepo extends JpaRepository<Notification, Long> {

    List<Notification> findByTo(User user);
    @Query(value = "SELECT * FROM notifications n WHERE n.action = :action AND n.to_id = :to AND n.from_id = :from AND n.post_id = :post", nativeQuery = true)
    Notification findExact(@Param("action") String action,
                                @Param("to") User to,
                                @Param("from") User from,
                                @Param("post") Post post);

    @Query(value = "SELECT * FROM notifications n WHERE n.action = :action AND n.to_id = :to AND n.from_id = :from", nativeQuery = true)
    Notification findFollow(@Param("action") String action,
                           @Param("to") User to,
                           @Param("from") User from);
}
