package com.nexora.chat.repository;

import com.nexora.chat.entity.Conversation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ConversationRepository extends JpaRepository<Conversation, Long> {

    @Query("SELECT c FROM Conversation c WHERE c.participantOne = :userId OR c.participantTwo = :userId ORDER BY c.updatedAt DESC")
    List<Conversation> findByParticipant(@Param("userId") String userId);

    @Query("SELECT c FROM Conversation c WHERE (c.participantOne = :userOne AND c.participantTwo = :userTwo) OR (c.participantOne = :userTwo AND c.participantTwo = :userOne)")
    Optional<Conversation> findByParticipants(@Param("userOne") String userOne, @Param("userTwo") String userTwo);
}
