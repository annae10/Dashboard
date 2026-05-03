package com.example.taskmanager.repository;

import com.example.taskmanager.model.Task;
import com.example.taskmanager.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface TaskRepository extends JpaRepository<Task, Long> {
    List<Task> findByUser(User user);

    @Query("SELECT t.dueDate, COUNT(t) FROM Task t WHERE t.user = :user AND t.completed = true AND t.dueDate >= :startDate GROUP BY t.dueDate")
    List<Object[]> countCompletedTasksByDate(@Param("user") User user, @Param("startDate") LocalDate startDate);
}
