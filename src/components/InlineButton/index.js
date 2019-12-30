import React from 'react'
import styles from './index.less'
import cn from 'classnames'

export default ({children, type, onClick, disabled, ...props}) => {
  const classnames = cn({
    'g-button-inline': true,
    [type]: true
  })
  return (
    <button type='button' style={{margin:'0px'}}
      disabled={disabled}
      onClick={onClick}
      className={classnames}
      {...props}
    >{children}</button>
  )
}
