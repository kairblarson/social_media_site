import { useEffect, useState } from 'react';
import { BsEmojiFrown, BsEmojiFrownFill } from 'react-icons/bs';

//nav done //local done
export default function DeletedPost() {
    
    return (
        <div className='deletedpost'>
            Sorry, this post has been deleted.
            <BsEmojiFrown />
        </div>
    )
}