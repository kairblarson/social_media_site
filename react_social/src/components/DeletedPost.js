import { useEffect, useState } from 'react';
import { BsEmojiFrown, BsEmojiFrownFill } from 'react-icons/bs';

export default function DeletedPost() {
    
    return (
        <div className='deletedpost'>
            Sorry, this post has been deleted.
            <BsEmojiFrown />
        </div>
    )
}