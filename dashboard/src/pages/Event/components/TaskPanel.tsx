import React, { useState } from 'react'
import {
  Box,
 } from '@mui/material'
import { CATETORY_SCENERYSPOT_TASK, TASK_TREK, TASK_QUESTION, TASK_SHARE, TASK_ART, TASK_CHECKIN } from 'constants/index'
import { Category, useCategories } from 'hooks/useCategories'
import TrekTask from './TrekTask'
import QuestionTask from './QuestionTask'
import GeocachingTask from './GeocachingTask'
import ScreenshotTask from './ScreenshotTask'
import PuzzleTask from './PuzzleTask'

interface TabPanelProps {
  value: { id: string }
  index: number
  hidden: boolean
}

interface State {
  categoryId?: string
}

export default function TaskPanel(props: TabPanelProps) {
  const { value, index, hidden, ...other } = props
  const categories = useCategories(CATETORY_SCENERYSPOT_TASK)
  const [values, setValues] = useState<State>({ categoryId: TASK_TREK })

  const handleChange = (value: Category) => {
    console.log({ value })
    setValues({ ...values, categoryId: value.id })
  }

  return (
    <div
      role="tabpanel"
      hidden={hidden}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
    >
      {!hidden && (
        <Box>
          {values.categoryId === TASK_TREK && (<TrekTask eventId={value.id} categories={categories} onCategoryChange={handleChange} />)}
          {values.categoryId === TASK_QUESTION && (<QuestionTask eventId={value.id} categories={categories} onCategoryChange={handleChange} />)}
          {values.categoryId === TASK_SHARE && (<GeocachingTask eventId={value.id} categories={categories} onCategoryChange={handleChange} />)}
          {values.categoryId === TASK_ART && (<ScreenshotTask eventId={value.id} categories={categories} onCategoryChange={handleChange} />)}
          {values.categoryId === TASK_CHECKIN && (<PuzzleTask eventId={value.id} categories={categories} onCategoryChange={handleChange} />)}
        </Box>
      )}
    </div>
  )
}