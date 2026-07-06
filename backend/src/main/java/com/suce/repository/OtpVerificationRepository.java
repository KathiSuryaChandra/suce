package com.suce.repository;

import com.suce.entity.OtpVerification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface OtpVerificationRepository extends JpaRepository<OtpVerification, Long> {

    @Modifying
    @Query("DELETE FROM OtpVerification o WHERE o.identifier = :identifier AND o.purpose = :purpose")
    void deleteAllFor(@Param("identifier") String identifier, @Param("purpose") String purpose);

    @Query("SELECT o FROM OtpVerification o WHERE o.identifier = :identifier AND o.purpose = :purpose " +
           "AND o.verified = false ORDER BY o.createdAt DESC LIMIT 1")
    Optional<OtpVerification> findLatestActive(@Param("identifier") String identifier, @Param("purpose") String purpose);
}
