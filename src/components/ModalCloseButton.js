import React from 'react';
import { Button } from 'react-native-paper';


const ModalCloseButton = ({onPress}) => {
    return (
        <Button 
        icon="close"
        mode="outlined" onPress={onPress}
       
        >
            Zamknij
        </Button>
    );
};

export default ModalCloseButton;