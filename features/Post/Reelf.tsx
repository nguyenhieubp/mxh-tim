import { Avatar, Stack } from '@mui/material'
import React from 'react'

const Reelf = () => {
    return (
        <div className='m-[1rem]'>
            <Stack direction="row" spacing={2}>
                <Avatar sx={{ width: 65, height: 65 }} alt="Remy Sharp" src="/static/images/avatar/1.jpg" />
                <Avatar sx={{ width: 65, height: 65 }} alt="Travis Howard" src="/static/images/avatar/2.jpg" />
                <Avatar sx={{ width: 65, height: 65 }} alt="Cindy Baker" src="/static/images/avatar/3.jpg" />
                <Avatar sx={{ width: 65, height: 65 }} alt="Remy Sharp" src="/static/images/avatar/1.jpg" />
                <Avatar sx={{ width: 65, height: 65 }} alt="Travis Howard" src="/static/images/avatar/2.jpg" />
                <Avatar sx={{ width: 65, height: 65 }} alt="Cindy Baker" src="/static/images/avatar/3.jpg" />
                <Avatar sx={{ width: 65, height: 65 }} alt="Remy Sharp" src="/static/images/avatar/1.jpg" />
                <Avatar sx={{ width: 65, height: 65 }} alt="Travis Howard" src="/static/images/avatar/2.jpg" />
            </Stack>
        </div>
    )
}

export default Reelf