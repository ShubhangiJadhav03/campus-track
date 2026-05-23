package com.college.complaints.repository;

import com.college.complaints.entity.Complaint;
import com.college.complaints.enums.ComplaintStatus;
import com.college.complaints.enums.Priority;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface ComplaintRepository extends JpaRepository<Complaint, Long> {

    Optional<Complaint> findByTicketNumber(String ticketNumber);

    @Query("SELECT c FROM Complaint c WHERE " +
           "(:status IS NULL OR c.status = :status) AND " +
           "(:priority IS NULL OR c.priority = :priority) AND " +
           "(:categoryId IS NULL OR c.category.id = :categoryId) AND " +
           "(:keyword IS NULL OR LOWER(c.title) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           " LOWER(c.ticketNumber) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    Page<Complaint> findWithFilters(
            @Param("status") ComplaintStatus status,
            @Param("priority") Priority priority,
            @Param("categoryId") Long categoryId,
            @Param("keyword") String keyword,
            Pageable pageable);

    @Query("SELECT c FROM Complaint c WHERE c.student.id = :studentId AND " +
           "(:status IS NULL OR c.status = :status)")
    Page<Complaint> findByStudentIdAndStatus(
            @Param("studentId") Long studentId,
            @Param("status") ComplaintStatus status,
            Pageable pageable);

    @Query("SELECT c FROM Complaint c WHERE c.assignedTo.id = :staffId AND " +
           "(:status IS NULL OR c.status = :status)")
    Page<Complaint> findByAssignedToIdAndStatus(
            @Param("staffId") Long staffId,
            @Param("status") ComplaintStatus status,
            Pageable pageable);

    Long countByStatus(ComplaintStatus status);

    Long countByStudentId(Long studentId);

    @Query("SELECT COUNT(c) FROM Complaint c WHERE c.student.id = :studentId AND c.status = :status")
    Long countByStudentIdAndStatus(@Param("studentId") Long studentId, @Param("status") ComplaintStatus status);

    Long countByAssignedToId(Long staffId);

    @Query("SELECT COUNT(c) FROM Complaint c WHERE c.assignedTo.id = :staffId AND c.status = :status")
    Long countByAssignedToIdAndStatus(@Param("staffId") Long staffId, @Param("status") ComplaintStatus status);

    @Query("SELECT c.category.name, COUNT(c) FROM Complaint c GROUP BY c.category.name")
    List<Object[]> countByCategory();

    @Query("SELECT MONTH(c.createdAt), COUNT(c) FROM Complaint c WHERE YEAR(c.createdAt) = :year GROUP BY MONTH(c.createdAt)")
    List<Object[]> countByMonthInYear(@Param("year") int year);

    @Query("SELECT c.status, COUNT(c) FROM Complaint c GROUP BY c.status")
    List<Object[]> countByStatusGrouped();

    @Query("SELECT u.name, COUNT(c) FROM Complaint c JOIN c.assignedTo u WHERE c.assignedTo IS NOT NULL GROUP BY u.name")
    List<Object[]> countByStaff();
}
