import React, { Children } from 'react';
import { Stack, Image, Heading } from '@chakra-ui/react';

export const Section = ({ imgSrc, heading, children }) => {
  return (
    <Stack justify='center' align='center' spacing={12}>
      <Image 
        src={imgSrc} 
        alt='wallet state' 
        width='324px'
      />
      <Heading 
        color="black" 
        fontSize= "36px" 
        fontWeight="extrabold"
      >
        {heading}
      </Heading>
      {children}
    </Stack>
  )
}