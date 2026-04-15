'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'
import { Bold, Italic, List, ListOrdered, Quote, Link as LinkIcon, Image as ImageIcon, Heading1, Heading2 } from 'lucide-react'

export function TipTapEditor({
  value,
  onChange,
  editable = true,
}: {
  value: string
  onChange: (html: string) => void
  editable?: boolean
}) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({ openOnClick: false, HTMLAttributes: { class: 'text-brand-gradient-end underline' } }),
      Image.configure({ HTMLAttributes: { class: 'rounded-xl my-4' } }),
    ],
    content: value || '<p></p>',
    editable,
    immediatelyRender: false,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: {
      attributes: {
        class:
          'prose prose-sm sm:prose-base max-w-none min-h-[300px] focus:outline-none py-4',
      },
    },
  })

  if (!editor) return null

  if (!editable) {
    return <EditorContent editor={editor} />
  }

  return (
    <div className="border border-gray-200 rounded-2xl overflow-hidden bg-white">
      <div className="flex flex-wrap items-center gap-1 border-b border-gray-200 px-2 py-2 bg-gray-50">
        <Btn on={editor.isActive('heading', { level: 1 })} onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}>
          <Heading1 className="w-4 h-4" />
        </Btn>
        <Btn on={editor.isActive('heading', { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
          <Heading2 className="w-4 h-4" />
        </Btn>
        <Divider />
        <Btn on={editor.isActive('bold')} onClick={() => editor.chain().focus().toggleBold().run()}>
          <Bold className="w-4 h-4" />
        </Btn>
        <Btn on={editor.isActive('italic')} onClick={() => editor.chain().focus().toggleItalic().run()}>
          <Italic className="w-4 h-4" />
        </Btn>
        <Divider />
        <Btn on={editor.isActive('bulletList')} onClick={() => editor.chain().focus().toggleBulletList().run()}>
          <List className="w-4 h-4" />
        </Btn>
        <Btn on={editor.isActive('orderedList')} onClick={() => editor.chain().focus().toggleOrderedList().run()}>
          <ListOrdered className="w-4 h-4" />
        </Btn>
        <Btn on={editor.isActive('blockquote')} onClick={() => editor.chain().focus().toggleBlockquote().run()}>
          <Quote className="w-4 h-4" />
        </Btn>
        <Divider />
        <Btn
          on={editor.isActive('link')}
          onClick={() => {
            const url = window.prompt('Link URL', editor.getAttributes('link').href ?? 'https://')
            if (url === null) return
            if (url === '') editor.chain().focus().unsetLink().run()
            else editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
          }}
        >
          <LinkIcon className="w-4 h-4" />
        </Btn>
        <Btn
          onClick={() => {
            const url = window.prompt('Image URL')
            if (url) editor.chain().focus().setImage({ src: url }).run()
          }}
        >
          <ImageIcon className="w-4 h-4" />
        </Btn>
      </div>
      <div className="px-4">
        <EditorContent editor={editor} />
      </div>
    </div>
  )
}

function Btn({
  on,
  onClick,
  children,
}: {
  on?: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`p-1.5 rounded-md transition-colors ${
        on ? 'bg-brand-gradient-end/15 text-brand-gradient-end' : 'text-gray-500 hover:bg-gray-200 hover:text-gray-900'
      }`}
    >
      {children}
    </button>
  )
}

function Divider() {
  return <div className="w-px h-5 bg-gray-200 mx-1" />
}
