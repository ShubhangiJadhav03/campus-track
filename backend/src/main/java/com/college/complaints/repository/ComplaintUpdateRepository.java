package com.college.complaints.repository;

import com.college.complaints.entity.ComplaintUpdate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ComplaintUpdateRepository extends JpaRepository<ComplaintUpdate, Long> {
    List<ComplaintUpdate> findByComplaintIdOrderByCreatedAtDesc(Long complaintId);
}
