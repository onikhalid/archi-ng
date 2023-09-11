
import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
// Use dynamic import for ReactQuill to prevent SSR issues
const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });
import 'react-quill/dist/quill.snow.css'; // Import Quill styles

function QuillEditor() {
    const [editorHtml, setEditorHtml] = useState('');

    // const modules = {
    //     toolbar: [
    //         [{ header: '1' }, { header: '2' }, { font: [] }],
    //         ['bold', 'italic', 'underline', 'strike'],
    //         [{ list: 'ordered' }, { list: 'bullet' }],
    //         [{ script: 'sub' }, { script: 'super' }],
    //         [{ indent: '-1' }, { indent: '+1' }],
    //         [{ direction: 'rtl' }],
    //         [{ align: [] }],
    //         ['link', 'image'],
    //         ['clean'],
    //     ],
    // };
    const modules = {
        toolbar: [
            [{ 'header': [ 2, 3, 4, 5, 6, false] }],
            [{ header: '2' }, { header: '3' }, { font: [] }],
            [{ size: [] }],
            ['bold', 'italic', 'underline', 'strike', 'blockquote'],
            [{ list: 'ordered' },{ list: 'bullet' },{ indent: '-1' },{ indent: '+1' }],
            ['link', 'image', 'video'],
            ['clean'],
            [{ 'color': [] }, { 'background': [] }],  
        ]
    
    };

    const formats = [
        // 'header',
        // 'bold', 'italic', 'underline', 'strike',
        // 'list', 'bullet', 'script', 'indent', 'direction', 'align',
        // 'link', 'image'
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

    const handleChange = (html) => {
        setEditorHtml(html);
    };





    

    return (
        <div>
            <ReactQuill
                value={editorHtml}
                onChange={handleChange}
                modules={modules}
                formats={formats}
            />
        </div>
    );
}

export default QuillEditor;













// function QuillEditor() {
//   const [editorHtml, setEditorHtml] = useState('');

//   const modules = {
//     toolbar: [
//       [{ header: '2' }, { header: '3' }, { header: '4' }, { header: '5' }, { header: '6' }],
//       ['bold', 'italic', 'underline', 'strike'],
//       [{ list: 'ordered' }, { list: 'bullet' }],
//       [{ script: 'sub' }, { script: 'super' }],
//       [{ indent: '-1' }, { indent: '+1' }],
//       [{ direction: 'rtl' }],
//       [{ align: [] }],
//       ['link', 'image'],
//       ['clean'],
//     ],
//   };

//   const formats = [
//     'header',
//     'bold', 'italic', 'underline', 'strike',
//     'list', 'bullet', 'script', 'indent', 'direction', 'align',
//     'link', 'image'
//   ];

//   const handleChange = (html) => {
//     setEditorHtml(html);
//   };

//   useEffect(() => {
//     // Perform any other client-side initialization if needed
//   }, []);

//   return (
//     <div>
//       <ReactQuill
//         value={editorHtml}
//         onChange={handleChange}
//         modules={modules}
//         formats={formats}
//       />
//     </div>
//   );
// }

// export default QuillEditor;
