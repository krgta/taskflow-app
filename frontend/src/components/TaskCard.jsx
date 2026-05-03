import { useState } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import styles from './TaskCard.module.css'

const PRIORITY_CONFIG = {
  High:   { label: 'High',   class: 'high',   dot: '#f87171' },
  Medium: { label: 'Medium', class: 'medium', dot: '#fbbf24' },
  Low:    { label: 'Low',    class: 'low',     dot: '#34d399' },
}

function formatDate(dateStr) {
  if (!dateStr) return null
  const d = new Date(dateStr)
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  const isOverdue = d < now
  return {
    label: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    isOverdue,
  }
}

export default function TaskCard({ task, onDelete, onEdit, isAdmin }) {
  const {
    attributes, listeners, setNodeRef, transform, transition, isDragging
  } = useSortable({ id: String(task.id) })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const priority = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.Low
  const dueDate = formatDate(task.due_date)

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`${styles.card} ${isDragging ? styles.dragging : ''}`}
    >
      {/* Drag handle */}
      <div className={styles.dragHandle} {...attributes} {...listeners} title="Drag to move">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="9" cy="5" r="1" fill="currentColor" />
          <circle cx="15" cy="5" r="1" fill="currentColor" />
          <circle cx="9" cy="12" r="1" fill="currentColor" />
          <circle cx="15" cy="12" r="1" fill="currentColor" />
          <circle cx="9" cy="19" r="1" fill="currentColor" />
          <circle cx="15" cy="19" r="1" fill="currentColor" />
        </svg>
      </div>

      <div className={styles.cardBody} onClick={() => onEdit && onEdit(task)} style={{ cursor: onEdit ? 'pointer' : 'default' }}>
        {/* Priority badge */}
        <div className={styles.cardTop}>
          <span className={`badge ${priority.class}`}>
            <span style={{ width: 5, height: 5, borderRadius: '50%', background: priority.dot, display: 'inline-block' }} />
            {priority.label}
          </span>

          {isAdmin && (
            <div className={styles.cardActions}>
              {onEdit && (
                <button className={`btn btn-ghost btn-icon ${styles.actionBtn}`} onClick={(e) => { e.stopPropagation(); onEdit(task); }} title="Edit task">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                  </svg>
                </button>
              )}
              {onDelete && (
                <button className={`btn btn-ghost btn-icon ${styles.actionBtn} ${styles.deleteBtn}`} onClick={(e) => { e.stopPropagation(); onDelete(task.id); }} title="Delete task">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="3 6 5 6 21 6"/>
                    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                    <path d="M10 11v6M14 11v6"/>
                  </svg>
                </button>
              )}
            </div>
          )}
        </div>

        {/* Title */}
        <h4 className={styles.title}>{task.title}</h4>

        {/* Description */}
        {task.description && (
          <p className={styles.description}>{task.description}</p>
        )}

        {/* Footer */}
        <div className={styles.cardFooter}>
          {task.assigned_to && (
            <div className={styles.assignee} title={`Assigned to: ${task.assigned_to}`}>
              <div className={styles.assigneeAvatar}>
                {String(task.assigned_to).slice(0, 2).toUpperCase()}
              </div>
            </div>
          )}

          {dueDate && (
            <span className={`${styles.dueDate} ${dueDate.isOverdue ? styles.overdue : ''}`}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12 6 12 12 16 14"/>
              </svg>
              {dueDate.label}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
