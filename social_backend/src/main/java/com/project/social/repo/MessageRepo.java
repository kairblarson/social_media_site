package com.project.social.repo;

import com.project.social.entity.Message;
import com.project.social.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MessageRepo extends JpaRepository<Message, Long> {
    @Query(value = "SELECT * FROM messages m WHERE m.sender_id = :sender LIMIT 20", nativeQuery = true)
    List<Message> getAllSenderMessages(@Param("sender") User sender);
    @Query(value = "SELECT * FROM messages m WHERE m.receiver_id = :receiver LIMIT 20", nativeQuery = true)
    List<Message> getAllReceiverMessages(User receiver);

    //this query is for getting all the messages between 2 people only
    @Query(value = "SELECT * FROM messages m WHERE m.sender_id = :currentUser AND m.receiver_id = :targetUser OR  m.sender_id = :targetUser AND m.receiver_id = :currentUser LIMIT 20", nativeQuery = true)
    List<Message> getChatMessages(@Param("currentUser") User currentUser,
                                  @Param("targetUser") User targetUser);
}
