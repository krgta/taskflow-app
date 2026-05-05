import { useState, useMemo } from 'react'
import {
  DndContext, DragOverlay, PointerSensor, useSensor, useSensors,
  closestCorners, useDroppable
} from '@dnd-kit/core'
import {
  SortableContext, verticalListSortingStrategy
} from '@dnd-kit/sortable'
import toast from 'react-hot-toast'
import TaskCard from './TaskCard'
import styles from './KanbanBoard.module.css'

const COLUMNS = [
  { id: 'todo',        label: 'To Do',       emoji: '📋', color: '#8888aa' },
  { id: 'in_progress', label: 'In Progress',  emoji: '⚡', color: '#7c6af7' },
  { id: 'done',        label: 'Done',         emoji: '✅', color: '#34d399' },
]

// Backend stores exactly: "To do", "In Progress", "Done"
function normalizeStatus(status) {
  if (!status) return 'todo'
  const s = status.toLowerCase().trim()
  if (s === 'in progress' || s === 'in_progress') return 'in_progress'
  if (s === 'done' || s === 'completed') return 'done'
  return 'todo'
}

// Map column id to exact backend status string
export function columnToStatus(colId) {
  if (colId === 'in_progress') return 'In Progress'
  if (colId === 'done') return 'Done'
  return 'To do'
}

export default function KanbanBoard({ tasks, onStatusChange, onDelete, onEdit, isAdmin }) {
  const [activeTask, setActiveTask] = useState(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  )

  const grouped = useMemo(() => {
    const map = { todo: [], in_progress: [], done: [] }
    for (const t of tasks) {
      const col = normalizeStatus(t.status)
      map[col].push(t)
    }
    return map
  }, [tasks])

  const findColumn = (id) => {
    const sid = String(id)
    for (const col of COLUMNS) {
      if (grouped[col.id].some(t => String(t.id) === sid)) return col.id
    }
    return null
  }

  const handleDragStart = ({ active }) => {
    const task = tasks.find(t => String(t.id) === String(active.id))
    setActiveTask(task || null)
  }

  const handleDragEnd = ({ active, over }) => {
    setActiveTask(null)
    if (!over) return

    const fromCol = findColumn(active.id)
    const isColId = COLUMNS.some(c => c.id === String(over.id))
    const toCol = isColId ? String(over.id) : findColumn(over.id)

    if (!toCol || !fromCol || fromCol === toCol) return

    if (fromCol === 'done') {
      toast.error('Cannot move a completed task')
      return
    }

    onStatusChange(active.id, columnToStatus(toCol))
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className={styles.board}>
        {COLUMNS.map(col => (
          <KanbanColumn
            key={col.id}
            column={col}
            tasks={grouped[col.id]}
            onDelete={onDelete}
            onEdit={onEdit}
            isAdmin={isAdmin}
          />
        ))}
      </div>

      <DragOverlay dropAnimation={{ duration: 200 }}>
        {activeTask ? (
          <div style={{ transform: 'rotate(2deg)', opacity: 0.92, pointerEvents: 'none' }}>
            <TaskCard task={activeTask} isAdmin={false} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}

function KanbanColumn({ column, tasks, onDelete, onEdit, isAdmin }) {
  const { setNodeRef, isOver } = useDroppable({ id: column.id })

  return (
    <div className={styles.column}>
      <div className={styles.columnHeader}>
        <div className={styles.columnLabel}>
          <span className={styles.columnEmoji}>{column.emoji}</span>
          <span className={styles.columnTitle}>{column.label}</span>
        </div>
        <span className={styles.columnCount} style={{ '--col-color': column.color }}>
          {tasks.length}
        </span>
      </div>

      <SortableContext
        items={tasks.map(t => String(t.id))}
        strategy={verticalListSortingStrategy}
      >
        <div
          ref={setNodeRef}
          className={styles.columnBody}
          data-column-id={column.id}
          style={isOver ? { background: 'var(--accent-soft)', borderRadius: 8 } : undefined}
        >
          {tasks.length === 0 ? (
            <div className={`${styles.emptyColumn} ${isOver ? styles.emptyOver : ''}`}>
              <span>Drop tasks here</span>
            </div>
          ) : (
            tasks.map(task => (
              <TaskCard
                key={task.id}
                task={task}
                onDelete={onDelete}
                onEdit={onEdit}
                isAdmin={isAdmin}
              />
            ))
          )}
        </div>
      </SortableContext>
    </div>
  )
}
