"use client"

import * as React from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function ChecklistsPage() {
  return (
    <div className="container max-w-3xl py-6 space-y-6">
       <h1 className="text-md md:text-2xl font-semibold">Шаблоны отчетов</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Button asChild size="lg" variant="outline" className="justify-start h-20 text-left">
          <Link href="/admin/answerTypes">Типы ответов</Link>
        </Button>

        <Button asChild size="lg" variant="outline" className="justify-start h-20 text-left">
          <Link href="/admin/checklists/items">Пункты чек-листа</Link>
        </Button>

        {/*<Button asChild size="lg" variant="outline" className="justify-start h-20 text-left">*/}
        {/*  <Link href="/admin/checklists/sections">Секции чек-листа</Link>*/}
        {/*</Button>*/}

        <Button asChild size="lg" variant="outline" className="justify-start h-20 text-left">
        <Link href="/admin/checklists/editor">Редактор чек-листа</Link>
        </Button>
      </div>
    </div>
  )
}


