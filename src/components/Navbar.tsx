import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

const Navbar = () => {
  return (
    <View style={{ padding: 10, backgroundColor: '#333' }}>
      <TouchableOpacity>
        <Text style={{ color: '#fff' }}>Home</Text>
      </TouchableOpacity>
      <TouchableOpacity>
        <Text style={{ color: '#fff' }}>Settings</Text>
      </TouchableOpacity>
    </View>
  );
};

export default Navbar;