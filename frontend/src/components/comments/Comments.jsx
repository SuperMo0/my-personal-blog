import React, { useEffect, useState } from 'react';
import { FaUserCircle } from "react-icons/fa";
import api from './../../utils/Api.js';
import NewComment from './../new-comment/NewComment.jsx';

export default function Comments({ id }) {
    const [comments, setComments] = useState([]);

    useEffect(() => {
        async function getComments() {
            try {
                let [result, ok] = await api(`/blogs/${id}/comments`);
                if (ok) setComments(result.comments);
            } catch (e) { console.error(e); }
        }
        getComments();
    }, [id]);

    function handleAddComment(comment) {
        setComments([comment, ...comments]);
    }

    return (
        <section>
            <h3 className="text-2xl font-bold mb-8">Discussion ({comments.length})</h3>

            <NewComment id={id} handleAddComment={handleAddComment} />

            <div className="space-y-6 mt-10">
                {comments.map((c) => (
                    <div key={c.id} className="flex gap-4 p-4 rounded-xl hover:bg-(--bg-card) transition-colors">
                        <div className="shrink-0 text-gray-400">
                            <FaUserCircle size={40} />
                        </div>
                        <div className="grow">
                            <div className="flex justify-between items-baseline mb-1">
                                <h4 className="font-bold text-(--text-primary)">{c.author_name}</h4>
                                <span className="text-xs text-(--text-secondary)">
                                    {new Date(c.created_at).toLocaleDateString()}
                                </span>
                            </div>
                            <p className="text-(--text-secondary) leading-relaxed">
                                {c.content}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}