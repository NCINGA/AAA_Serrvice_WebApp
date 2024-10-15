import React, {FC, useState} from 'react';
import {Card} from 'primereact/card';
import {InputText} from 'primereact/inputtext';
import {Password} from 'primereact/password';
import {Button} from 'primereact/button';
import './login.css';

type Props = {
    state: (isAuth: boolean) => void;
}
const LoginPage: FC<Props> = ({state}) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState("")

    const handleLogin = () => {
        if (username === "demo" && password === "demo") {
            state(true);
        } else {
            state(false);
            setError("Username or Password wrong")
        }
    };

    return (
        <div className="login-page">
            <Card className="login-card" title="Welcome 3A Web Console">
                <div className="p-fluid">
                    <div className="p-field">
                        <label htmlFor="username">Username</label>
                        <InputText id="username" value={username} onChange={(e) => setUsername(e.target.value)}/>
                    </div>
                    <div className="p-field">
                        <label htmlFor="password">Password</label>
                        <Password id="password" value={password} onChange={(e) => setPassword(e.target.value)}
                                  feedback={false}/>
                    </div>
                    <h5>{error}</h5>

                    <Button label="Login" className="p-button-rounded p-button-primary" onClick={handleLogin}/>
                </div>
            </Card>
        </div>
    );
};

export default LoginPage;
