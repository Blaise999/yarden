import {redirect} from 'next/navigation';
import {isAdmin} from '../../../libs/adminAuth';
import AngelAdmin from './panel';
export default async function Page(){if(!await isAdmin())redirect('/admin');return <AngelAdmin/>}
