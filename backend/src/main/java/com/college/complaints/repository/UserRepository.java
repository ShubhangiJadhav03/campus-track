package com.college.complaints.repository;

import com.college.complaints.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    Optional<User> findByResetToken(String resetToken);

    @Query("""
            SELECT u
            FROM User u
            WHERE u.role.name = :roleName
            AND u.isActive = :isActive
            """)
    List<User> findByRoleNameAndIsActive(
            @Param("roleName") String roleName,
            @Param("isActive") Boolean isActive
    );

    @Query("""
            SELECT u
            FROM User u
            WHERE u.role.name = 'STAFF'
            AND u.isActive = true
            """)
    List<User> findAllActiveStaff();

    @Query("""
            SELECT COUNT(u)
            FROM User u
            WHERE u.role.name = :roleName
            """)
    Long countByRoleName(@Param("roleName") String roleName);
}