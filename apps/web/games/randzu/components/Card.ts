import React from 'react'

export default function Card({ value:any, suit:any, className:any }) {
    return (
        <>
            {suit!=='BACK'&&<img className={className} alt={suit+"-"+value} src={require(`../assets/cards/${suit.toUpperCase()}/${suit.toUpperCase()}_${value}.svg`).default}/>}
            {suit==='BACK'&&<img className={className} alt={suit+"-"+value} src={require(`../assets/cards/${suit}.svg`).default}/>}
        </>
    )
}

// export default Card