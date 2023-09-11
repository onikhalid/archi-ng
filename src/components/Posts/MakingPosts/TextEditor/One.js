import React, { useState } from 'react';
import ReactQuill, { Quill } from 'react-quill';
import 'react-quill/dist/quill.snow.css';
// import ImageResize from 'quill-image-resize-module-react';

// import './styles.css';

// Quill.register('modules/imageResize');

const Editor = (props) => {
    const [editorHtml, setEditorHtml] = useState('');

    const handleChange = (html) => {
        setEditorHtml(html);
        console.log(html);
    };

    return (
        <ReactQuill
            theme="snow"
            onChange={handleChange}
            value={editorHtml}
            modules={Editor.modules}
            formats={Editor.formats}
            bounds={'#root'}
            placeholder={props.placeholder}
        />
    );
};

Editor.modules = {
    toolbar: [
        [{ header: '1' }, { header: '2' }, { font: [] }],
        [{ size: [] }],
        ['bold', 'italic', 'underline', 'strike', 'blockquote'],
        [
            { list: 'ordered' },
            { list: 'bullet' },
            { indent: '-1' },
            { indent: '+1' }
        ],
        ['link', 'image', 'video'],
        ['clean']
    ],
    clipboard: {
        matchVisual: false
    },
    // imageResize: {
    //     parchment: Quill.import('parchment'),
    //     modules: ['Resize', 'DisplaySize']
    // }
};

Editor.formats = [
    'header',
    'font',
    'size',
    'bold',
    'italic',
    'underline',
    'strike',
    'blockquote',
    'list',
    'bullet',
    'indent',
    'link',
    'image',
    'video'
];

export default Editor;
