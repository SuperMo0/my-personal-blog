import React from 'react';
import { Editor } from '@tinymce/tinymce-react';

export default function MyEditor({ initialValue, handleInit, dark, readOnly = false }) {

    return (
        <Editor
            licenseKey='gpl'
            key={dark ? "dark-editor" : "light-editor"}
            initialValue={initialValue}
            disabled={readOnly}
            tinymceScriptSrc={'/tinymce/tinymce.min.js'}
            onInit={handleInit}
            init={{
                branding: false,
                promotion: false,
                height: 600,
                menubar: true,
                resize: false,
                skin: dark ? 'oxide-dark' : 'oxide',
                content_css: dark ? 'dark' : 'default',
                plugins: [
                    'advlist', 'autolink', 'lists', 'link', 'image', 'charmap',
                    'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
                    'insertdatetime', 'media', 'table', 'preview', 'wordcount', 'codesample'
                ],
                toolbar: 'undo redo | blocks | ' +
                    'bold italic forecolor | alignleft aligncenter ' +
                    'alignright alignjustify | bullist numlist outdent indent | ' +
                    'removeformat | codesample | help',
                content_style: `
                    body { font-family: Merriweather, serif; font-size: 16px; line-height: 1.6; }
                    pre { background: #2d2d2d; color: #ccc; padding: 10px; border-radius: 5px; }
                `,
                codesample_global_prismjs: true,
            }}
        />
    );
}
