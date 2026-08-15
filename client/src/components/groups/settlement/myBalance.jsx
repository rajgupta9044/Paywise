import { Card, CardContent, Grid, Stack, Typography } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getGroupSettleService } from '../../../services/groupServices';
import { convertToCurrency, currencyFind } from '../../../utils/helper';
import AlertBanner from '../../AlertBanner';
import Loading from '../../loading';
import SettlementCard from './settlementCard';

const profile = JSON.parse(localStorage.getItem('profile') || 'null');
const emailId = profile?.emailId;

const MyBalance = ({ currencyType, balance }) => {
    const params = useParams();
    const [loading, setLoading] = useState(true);
    const [alert, setAlert] = useState(false);
    const [alertMessage, setAlertMessage] = useState('');
    const [settlements, setSettlements] = useState([]);
    const [reload, setReload] = useState(false);

    useEffect(() => {
        const loadSettlements = async () => {
            setLoading(true);
            const response = await getGroupSettleService({ id: params.groupId }, setAlert, setAlertMessage);
            setSettlements(response?.data?.data || []);
            setLoading(false);
        };
        loadSettlements();
    }, [params.groupId, reload]);

    const owing = settlements.filter(([from, , amount]) => from === emailId && amount > 0);
    const owed = settlements.filter(([, to, amount]) => to === emailId && amount > 0);
    const hasBalance = Number(balance) !== 0;

    if (loading) return <Loading />;

    return (
        <Stack spacing={3} sx={{ pb: 3 }}>
            <AlertBanner showAlert={alert} alertMessage={alertMessage} severity="error" />
            <Card>
                <CardContent>
                    <Typography variant="h5" gutterBottom>My balance</Typography>
                    <Typography variant="h3" color={balance > 0 ? 'success.dark' : balance < 0 ? 'error.dark' : 'text.primary'}>
                        {currencyFind(currencyType)} {convertToCurrency(Math.abs(balance || 0))}
                    </Typography>
                    <Typography color="text.secondary">
                        {!hasBalance ? 'You are all settled up.' : balance > 0 ? 'You should receive this amount.' : 'You need to pay this amount.'}
                    </Typography>
                </CardContent>
            </Card>

            {owing.length > 0 && <>
                <Typography variant="h5">You need to pay</Typography>
                <Grid container spacing={2}>
                    {owing.map((settlement, index) => (
                        <Grid item xs={12} md={6} key={`${settlement[1]}-${index}`}>
                            <SettlementCard mySettle={settlement} currencyType={currencyType} setReload={setReload} />
                        </Grid>
                    ))}
                </Grid>
            </>}

            {owed.length > 0 && <>
                <Typography variant="h5">You should receive</Typography>
                <Grid container spacing={2}>
                    {owed.map(([from, , amount], index) => (
                        <Grid item xs={12} md={6} key={`${from}-${index}`}>
                            <Card sx={{ bgcolor: 'success.lighter' }}>
                                <CardContent>
                                    <Typography variant="h6">{from.split('@')[0]}</Typography>
                                    <Typography color="text.secondary">owes you</Typography>
                                    <Typography variant="h5" color="success.dark">
                                        {currencyFind(currencyType)} {convertToCurrency(amount)}
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            </>}
        </Stack>
    );
};

export default MyBalance;
