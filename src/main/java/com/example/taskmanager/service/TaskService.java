package com.example.taskmanager.service;

import com.example.taskmanager.dto.TaskDto;
import com.example.taskmanager.model.Task;
import com.example.taskmanager.model.User;
import com.example.taskmanager.repository.TaskRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class TaskService {

    @Autowired
    private TaskRepository taskRepository;

    public List<TaskDto> getTasksForUser(User user) {
        return taskRepository.findByUser(user).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public TaskDto createTask(TaskDto taskDto, User user) {
        Task task = convertToEntity(taskDto);
        task.setUser(user);
        return convertToDto(taskRepository.save(task));
    }

    public TaskDto updateTask(Long id, TaskDto taskDto, User user){
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Task not found"));
        if(!task.getUser().getId().equals(user.getId())){
            throw new RuntimeException("Access denied");
        }
        task.setTitle(taskDto.getTitle());
        task.setDescription(taskDto.getDescription());
        task.setCompleted(taskDto.isCompleted());
        task.setDueDate(taskDto.getDueDate());
        return convertToDto(taskRepository.save(task));
    }

    public void deleteTask(Long id, User user) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Task not found"));
        if(!task.getUser().getId().equals(user.getId())){
            throw new RuntimeException("Access denied");
        }
        taskRepository.delete(task);
    }

    public List<Object[]> getLast5DaysStats(User user){
        LocalDate endDate = LocalDate.now();
        LocalDate startDate = endDate.minusDays(4);
        return taskRepository.countCompletedTasksByDate(user, startDate);
    }

    private TaskDto convertToDto(Task task) {
        TaskDto dto = new TaskDto();
        dto.setId(task.getId());
        dto.setTitle(task.getTitle());
        dto.setDescription(task.getDescription());
        dto.setCompleted(task.isCompleted());
        dto.setDueDate(task.getDueDate());
        return dto;
    }

    private Task convertToEntity(TaskDto dto){
        Task task = new Task();
        task.setId(dto.getId());
        task.setTitle(dto.getTitle());
        task.setDescription(dto.getDescription());
        task.setCompleted(dto.isCompleted());
        task.setDueDate(dto.getDueDate());
        return task;
    }
}
