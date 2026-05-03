package com.example.taskmanager.dto;

import lombok.Data;

import java.time.LocalDate;

@Data
public class TaskDto {
    private Long id;
    private String title;
    private String description;
    private boolean completed;
    private LocalDate dueDate;
}
