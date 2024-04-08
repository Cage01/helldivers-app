import { Chip, Tooltip } from '@nextui-org/react'
import React from 'react'

function MultihitChip() {
    return (
        <Tooltip content="Some weapons like the Arc Thrower have multihit spread. This allows the number of hits to exceed the number of shots fired since they are recorded seperately by AHGS">
            <Chip size="sm" color='default'>?</Chip>
        </Tooltip>
    )
}

export default MultihitChip