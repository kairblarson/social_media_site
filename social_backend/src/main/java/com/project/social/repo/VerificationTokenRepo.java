package com.project.social.repo;

import com.project.social.entity.VerificationToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface VerificationTokenRepo extends JpaRepository<VerificationToken, Long> {

    VerificationToken getTokenByToken(String token);
}
